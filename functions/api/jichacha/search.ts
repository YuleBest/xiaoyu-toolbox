import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

import { BRAND_MAP } from "./brand_map";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);

  // 1. 获取通用关键词和分页参数
  const qIsOriginal = searchParams.get("q") || "";
  let q = qIsOriginal.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;

  // 2. 获取特定字段参数 (对应表中的列名)
  const filterParams = [
    "model",
    // "dtype", // dtype 单独处理
    "brand",
    "code",
    "code_alias",
    "model_name",
    "ver_name",
  ];
  const dtypeParam = searchParams.get("dtype");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  /**
   * Helper to build and execute query
   */
  const executeSearch = async (
    searchQ: string,
  ): Promise<{
    results: any[];
    total: number;
    dtypes: any[];
    usedQuery?: string;
  }> => {
    let whereClause = "WHERE 1=1";
    const bindings: any[] = [];

    // A. 处理通用关键词搜索 (支持多关键词，空格分隔)
    // 逻辑：每个关键词都必须匹配 (AND)，但单个关键词可以匹配任意字段 (OR)
    if (searchQ) {
      const keywords = searchQ.split(/\s+/).filter((k) => k.length > 0);

      if (keywords.length > 0) {
        // 对于每个关键词，添加一个 AND (...) 块
        for (const kw of keywords) {
          whereClause += ` AND (
            model LIKE ? OR 
            code LIKE ? OR 
            code_alias LIKE ? OR 
            model_name LIKE ? OR
            brand LIKE ? 
          )`;
          // 对应5个字段
          bindings.push(`%${kw}%`, `%${kw}%`, `%${kw}%`, `%${kw}%`, `%${kw}%`);
        }
      }
    }

    // B. 处理特定字段的精准/模糊搜索 (不含 dtype)
    for (const param of filterParams) {
      const val = searchParams.get(param);
      if (val) {
        whereClause += ` AND ${param} LIKE ?`;
        bindings.push(`%${val}%`);
      }
    }

    // C. 获取聚合信息
    const dtypeQuery = `SELECT dtype, COUNT(*) as count FROM phone_models ${whereClause} GROUP BY dtype ORDER BY count DESC`;
    const { results: dtypes } = await context.env.DB.prepare(dtypeQuery)
      .bind(...bindings)
      .all();

    // D. 应用 dtype 筛选
    if (dtypeParam) {
      whereClause += ` AND dtype = ?`;
      bindings.push(dtypeParam);
    }

    // E. 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM phone_models ${whereClause}`;
    const totalResult = await context.env.DB.prepare(countQuery)
      .bind(...bindings)
      .first();
    const total = (totalResult?.total as number) || 0;

    // F. 获取数据 (分页)
    // 排序优化：
    // 1. 优先显示包含完整关键词的结果（模拟匹配度高）
    // 2. 其次按 rowid 倒序（新入库在前）
    let orderBy = "ORDER BY rowid DESC";

    // 如果有搜索词，尝试简单的相关性排序
    // 注意：SQLite D1 中 instr/case 支持有限，这里简单处理：
    // 如果完全匹配 keywords[0] 的排前面 (可选优化，这里暂时保持 rowid DESC 即可，
    // 因为 WHERE 已经过滤了)
    // 根据用户需求：把匹配度低的结果放在后面 -> 也就是匹配度高的放在前面
    // 这里我们可以用 length(model) 越短越匹配? 或者 rowid 越新越匹配?
    // 用户需求2: "xiaomi 17" 匹配 "xiaomi" 和 "17"。
    // 这里我们已经做到了 AND 逻辑。

    const dataQuery = `SELECT *, rowid as _id FROM phone_models ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;

    const { results } = await context.env.DB.prepare(dataQuery)
      .bind(...bindings, limit, offset)
      .all();

    return { results, total, dtypes, usedQuery: searchQ };
  };

  try {
    // 第一次尝试：原始查询
    let result = await executeSearch(q);
    let finalQuery = q;
    let fallbackType = "";

    // 智能推荐/Fallback 逻辑
    if (result.total === 0 && q) {
      // 策略 1: 尝试替换中文品牌名为英文
      let modifiedQ = q;
      let hasBrandReplacement = false;

      // 遍历 BRAND_MAP 看是否有匹配的中文品牌名
      for (const [cn, en] of Object.entries(BRAND_MAP)) {
        if (modifiedQ.includes(cn)) {
          modifiedQ = modifiedQ.replace(cn, en);
          hasBrandReplacement = true;
        }
      }

      if (hasBrandReplacement && modifiedQ !== q) {
        console.log(`Fallback Strategy 1: '${q}' -> '${modifiedQ}'`);
        const result2 = await executeSearch(modifiedQ);
        if (result2.total > 0) {
          result = result2;
          finalQuery = modifiedQ;
          fallbackType = "translated_brand";
        }
      }

      // 策略 2: 如果还是没结果，且包含品牌词，尝试只搜品牌 (去掉数字/型号)
      // 比如 "Xiaomi 17" -> 搜不到 -> 搜 "Xiaomi"
      if (result.total === 0) {
        const keywords = (hasBrandReplacement ? finalQuery : q).split(/\s+/);
        // 假设第一个词是品牌？或者检查哪个词是品牌
        let brandKw = "";
        for (const kw of keywords) {
          // 检查是否在 BRAND_MAP values 中，或者就是常见的品牌
          const isBrandCode = Object.values(BRAND_MAP).includes(
            kw.toLowerCase(),
          );
          if (isBrandCode) {
            brandKw = kw;
            break;
          }
        }

        if (brandKw && keywords.length > 1) {
          console.log(
            `Fallback Strategy 2: '${q}' -> '${brandKw}' (Brand fallback)`,
          );
          const result3 = await executeSearch(brandKw);
          if (result3.total > 0) {
            result = result3;
            finalQuery = brandKw;
            fallbackType = "brand_fallback";
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        page,
        limit,
        total: result.total,
        dtypes: result.dtypes,
        results: result.results,
        // 告诉前端我们是否修改了查询，以便前端提示用户
        originalQuery: qIsOriginal,
        usedQuery: result.usedQuery,
        fallbackType, // 'translated_brand' | 'brand_fallback' | ''
      }),
      { headers: corsHeaders },
    );
  } catch (err: any) {
    console.error("Search API Error:", err);
    console.error("Query:", q);
    console.error("Params:", searchParams.toString());
    return new Response(
      JSON.stringify({
        error: "搜索失败",
        detail: err.message,
        stack: err.stack,
      }),
      { status: 500, headers: corsHeaders },
    );
  }
};
