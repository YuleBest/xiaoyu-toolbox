import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

// 假设这些辅助函数和常量都在同目录的 brand_map.ts 中
import { BRAND_MAP, getRelatedKeywords, segmentSearchQuery } from "./brand_map";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);

  // 1. 获取基础参数
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
   * 核心搜索执行函数 - 已优化为 FTS5 模式
   */
  const executeSearch = async (searchQ: string) => {
    let bindings: any[] = [];
    let ftsSubQuery = "";

    // A. 处理 FTS5 全文搜索逻辑
    if (searchQ) {
      const keywords = segmentSearchQuery(searchQ);
      if (keywords.length > 0) {
        // 将关键词转为 FTS5 语法，例如 "Xiaomi 14" -> "Xiaomi* AND 14*"
        // 这样可以实现多词 AND 查询，且支持前缀匹配
        const ftsExpression = keywords
          .map((k) => `${k.replace(/[*\-"']/g, "")}*`)
          .join(" AND ");

        ftsSubQuery = `rowid IN (SELECT rowid FROM phone_models_fts WHERE phone_models_fts MATCH ?)`;
        bindings.push(ftsExpression);
      }
    }

    // B. 构建基础 WHERE 子句 (不含 dtype，用于聚合统计)
    let baseWhere = ftsSubQuery ? `WHERE ${ftsSubQuery}` : "WHERE 1=1";

    // 增加 URL 参数中的特定字段过滤 (精准匹配以利用普通索引)
    for (const param of filterParams) {
      if (param === "ver_name") continue; // ver_name 聚合逻辑特殊，此处跳过
      const val = searchParams.get(param);
      if (val) {
        baseWhere += ` AND ${param} = ?`;
        bindings.push(val);
      }
    }

    // C. 重新构建 ver_name 专用过滤条件 (排除 ver_name 自身，方便前端切换)
    // 这里为了性能，复用 baseWhere 的逻辑
    const verNameWhere = baseWhere;
    const verNameBindings = [...bindings];

    // D. 并发执行所有查询，极大降低响应延迟
    // 1. dtype 聚合
    // 2. ver_name 聚合
    // 3. 符合当前所有条件（含 dtype）的总数
    const [dtypesRes, verNamesRes, totalRes] = await Promise.all([
      context.env.DB.prepare(
        `SELECT dtype, COUNT(*) as count FROM phone_models ${baseWhere} GROUP BY dtype ORDER BY count DESC`,
      )
        .bind(...bindings)
        .all(),
      context.env.DB.prepare(
        `SELECT ver_name, COUNT(*) as count FROM phone_models ${verNameWhere} AND ver_name != '' AND ver_name IS NOT NULL GROUP BY ver_name ORDER BY count DESC`,
      )
        .bind(...verNameBindings)
        .all(),
      context.env.DB.prepare(
        `SELECT COUNT(*) as total FROM phone_models ${baseWhere}${dtypeParam ? " AND dtype = ?" : ""}`,
      )
        .bind(...bindings, ...(dtypeParam ? [dtypeParam] : []))
        .first(),
    ]);

    const total = Number(totalRes?.total || 0);

    // E. 执行分页数据查询
    const dataWhere = dtypeParam ? `${baseWhere} AND dtype = ?` : baseWhere;
    const dataBindings = dtypeParam
      ? [...bindings, dtypeParam, limit, offset]
      : [...bindings, limit, offset];

    const { results } = await context.env.DB.prepare(
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
    // 第一步：尝试原始查询
    let result = await executeSearch(q);
    let finalQuery = q;
    let fallbackType = "";

    // 第二步：智能 Fallback 逻辑
    if (result.total === 0 && q) {
      // 策略 1: 中文品牌名替换 (e.g., 小米 -> Xiaomi)
      let modifiedQ = q;
      let hasBrandReplacement = false;

      for (const [cn, en] of Object.entries(BRAND_MAP)) {
        if (modifiedQ.includes(cn)) {
          modifiedQ = modifiedQ.replace(cn, en);
          hasBrandReplacement = true;
        }
      }

      if (hasBrandReplacement && modifiedQ !== q) {
        console.log(`Fallback 1: '${q}' -> '${modifiedQ}'`);
        const result2 = await executeSearch(modifiedQ);
        if (result2.total > 0) {
          result = result2;
          finalQuery = modifiedQ;
          fallbackType = "translated_brand";
        }
      }

      // 策略 2: 品牌词退化 (e.g., "Xiaomi 17" 无结果 -> 只搜 "Xiaomi")
      if (result.total === 0) {
        const keywords = (hasBrandReplacement ? finalQuery : q).split(/\s+/);
        let brandKw = "";

        for (const kw of keywords) {
          const lowerKw = kw.toLowerCase();
          // 检查是否是已知品牌
          const isBrand = Object.values(BRAND_MAP).includes(lowerKw);
          if (isBrand) {
            brandKw = kw;
            break;
          }
          // 检查同义词
          const synonyms = getRelatedKeywords(kw);
          const foundSynonym = synonyms.find((syn) =>
            Object.values(BRAND_MAP).includes(syn.toLowerCase()),
          );
          if (foundSynonym) {
            brandKw = foundSynonym;
            break;
          }
        }

        if (brandKw && keywords.length > 1) {
          console.log(`Fallback 2: '${q}' -> '${brandKw}'`);
          const result3 = await executeSearch(brandKw);
          if (result3.total > 0) {
            result = result3;
            finalQuery = brandKw;
            fallbackType = "brand_fallback";
          }
        }
      }
    }

    // 最终返回
    return new Response(
      JSON.stringify({
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
      }),
      { headers: corsHeaders },
    );
  } catch (err: any) {
    console.error("Search API Error:", err);
    return new Response(
      JSON.stringify({
        error: "搜索失败",
        detail: err.message,
      }),
      { status: 500, headers: corsHeaders },
    );
  }
};
