import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);

  // 1. 获取通用关键词和分页参数
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;

  // 2. 获取特定字段参数 (对应表中的列名)
  const filterParams = [
    "model",
    "dtype",
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

  try {
    let baseQuery = "FROM phone_models WHERE 1=1";
    const bindings: any[] = [];
    let bindIndex = 1;

    // A. 处理通用关键词搜索 (对多个列进行 OR 匹配)
    if (q) {
      baseQuery += ` AND (
        model LIKE ?${bindIndex} OR 
        code LIKE ?${bindIndex} OR 
        code_alias LIKE ?${bindIndex} OR 
        model_name LIKE ?${bindIndex}
      )`;
      bindings.push(`%${q}%`);
      bindIndex++;
    }

    // B. 处理特定字段的精准/模糊搜索
    for (const param of filterParams) {
      const val = searchParams.get(param);
      if (val) {
        // 如果用户传了具体字段，比如 brand=apple，我们就增加一个 AND 条件
        baseQuery += ` AND ${param} LIKE ?${bindIndex}`;
        bindings.push(`%${val}%`);
        bindIndex++;
      }
    }

    // C. 获取总数
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const totalResult = await context.env.DB.prepare(countQuery)
      .bind(...bindings)
      .first();
    const total = totalResult?.total || 0;

    // D. 排序和分页
    // Cloudflare D1 不支持 SQL_CALC_FOUND_ROWS，所以必须查两次
    const dataQuery = `SELECT * ${baseQuery} LIMIT ?${bindIndex} OFFSET ?${bindIndex + 1}`;
    bindings.push(limit, offset);

    const { results } = await context.env.DB.prepare(dataQuery)
      .bind(...bindings)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        page,
        limit,
        total,
        results: results,
      }),
      { headers: corsHeaders },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "搜索失败", detail: err.message }),
      { status: 500, headers: corsHeaders },
    );
  }
};
