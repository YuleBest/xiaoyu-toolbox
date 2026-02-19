import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

// 假设这些辅助函数和常量都在同目录的 brand_map.ts 中
import { BRAND_MAP, segmentSearchQuery } from "./brand_map";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // --- 1. 缓存层逻辑 ---
  const cache = caches.default;
  // 缓存键包含 URL 的所有参数（q, page, dtype 等）
  const cacheKey = new Request(url.toString(), request);

  // 尝试从缓存中读取结果
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    console.log("🚀 Cache Hit: 直接返回边缘缓存数据，0 Rows Read");
    return cachedResponse;
  }

  // --- 2. 基础参数解析 ---
  const { searchParams } = url;
  const qIsOriginal = searchParams.get("q") || "";
  let q = qIsOriginal.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;
  const dtypeParam = searchParams.get("dtype");

  const filterParams = [
    "model",
    "brand",
    "code",
    "code_alias",
    "model_name",
    "ver_name",
  ];
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  /**
   * 核心搜索执行函数 (FTS5 + 并发查询)
   */
  const executeSearch = async (searchQ: string) => {
    let bindings: any[] = [];
    let ftsSubQuery = "";

    if (searchQ) {
      const keywords = segmentSearchQuery(searchQ);
      if (keywords.length > 0) {
        // FTS5 语法转换
        const ftsExpression = keywords
          .map((k) => `${k.replace(/[*\-"']/g, "")}*`)
          .join(" AND ");

        ftsSubQuery = `rowid IN (SELECT rowid FROM phone_models_fts WHERE phone_models_fts MATCH ?)`;
        bindings.push(ftsExpression);
      }
    }

    let baseWhere = ftsSubQuery ? `WHERE ${ftsSubQuery}` : "WHERE 1=1";

    // 特定字段过滤
    for (const param of filterParams) {
      if (param === "ver_name") continue;
      const val = searchParams.get(param);
      if (val) {
        baseWhere += ` AND ${param} = ?`;
        bindings.push(val);
      }
    }

    // 并发执行聚合与统计
    const [dtypesRes, verNamesRes, totalRes] = await Promise.all([
      env.DB.prepare(
        `SELECT dtype, COUNT(*) as count FROM phone_models ${baseWhere} GROUP BY dtype ORDER BY count DESC`,
      )
        .bind(...bindings)
        .all(),
      env.DB.prepare(
        `SELECT ver_name, COUNT(*) as count FROM phone_models ${baseWhere} AND ver_name != '' AND ver_name IS NOT NULL GROUP BY ver_name ORDER BY count DESC`,
      )
        .bind(...bindings)
        .all(),
      env.DB.prepare(
        `SELECT COUNT(*) as total FROM phone_models ${baseWhere}${dtypeParam ? " AND dtype = ?" : ""}`,
      )
        .bind(...bindings, ...(dtypeParam ? [dtypeParam] : []))
        .first(),
    ]);

    const total = Number(totalRes?.total || 0);

    // 分页查询详情
    const dataWhere = dtypeParam ? `${baseWhere} AND dtype = ?` : baseWhere;
    const dataBindings = dtypeParam
      ? [...bindings, dtypeParam, limit, offset]
      : [...bindings, limit, offset];

    const { results } = await env.DB.prepare(
      `SELECT *, rowid as _id FROM phone_models ${dataWhere} ORDER BY rowid DESC LIMIT ? OFFSET ?`,
    )
      .bind(...dataBindings)
      .all();

    return {
      results,
      total,
      dtypes: dtypesRes.results,
      verNames: verNamesRes.results,
      usedQuery: searchQ,
    };
  };

  try {
    // 执行原始查询
    let result = await executeSearch(q);
    let fallbackType = "";

    // 智能 Fallback 逻辑
    if (result.total === 0 && q) {
      // 策略 1: 品牌名中英替换
      let modifiedQ = q;
      let hasBrandReplacement = false;
      for (const [cn, en] of Object.entries(BRAND_MAP)) {
        if (modifiedQ.includes(cn)) {
          modifiedQ = modifiedQ.replace(cn, en);
          hasBrandReplacement = true;
        }
      }
      if (hasBrandReplacement && modifiedQ !== q) {
        const result2 = await executeSearch(modifiedQ);
        if (result2.total > 0) {
          result = result2;
          fallbackType = "translated_brand";
        }
      }

      // 策略 2: 品牌降级搜索
      if (result.total === 0) {
        const keywords = q.split(/\s+/);
        let brandKw = "";
        for (const kw of keywords) {
          if (Object.values(BRAND_MAP).includes(kw.toLowerCase())) {
            brandKw = kw;
            break;
          }
        }
        if (brandKw && keywords.length > 1) {
          const result3 = await executeSearch(brandKw);
          if (result3.total > 0) {
            result = result3;
            fallbackType = "brand_fallback";
          }
        }
      }
    }

    // --- 3. 构造响应与存入缓存 ---
    const responseData = {
      success: true,
      page,
      limit,
      total: result.total,
      dtypes: result.dtypes,
      verNames: result.verNames,
      results: result.results,
      originalQuery: qIsOriginal,
      usedQuery: result.usedQuery,
      fallbackType,
    };

    const finalResponse = new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        // s-maxage=10800 是 3 小时的边缘缓存，适合你的爬虫更新频率
        "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=60",
      },
    });

    // 关键：利用 waitUntil 在后台存入缓存，不阻塞用户下载数据
    context.waitUntil(cache.put(cacheKey, finalResponse.clone()));

    return finalResponse;
  } catch (err: any) {
    console.error("Search API Error:", err);
    return new Response(
      JSON.stringify({ error: "搜索失败", detail: err.message }),
      { status: 500, headers: corsHeaders },
    );
  }
};
