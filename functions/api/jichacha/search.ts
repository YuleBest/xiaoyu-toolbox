import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);

  // 1. 获取通用关键词和分页参数
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "50");

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
    let query = "SELECT * FROM phone_models WHERE 1=1";
    const bindings: any[] = [];
    let bindIndex = 1;

    // A. 处理通用关键词搜索 (对多个列进行 OR 匹配)
    if (q) {
      query += ` AND (
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
        query += ` AND ${param} LIKE ?${bindIndex}`;
        bindings.push(`%${val}%`);
        bindIndex++;
      }
    }

    // C. 排序和分页
    query += ` LIMIT ?${bindIndex}`;
    bindings.push(limit);

    const { results } = await context.env.DB.prepare(query)
      .bind(...bindings)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
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
