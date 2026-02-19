import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    // 1. 获取总数 (优化点：由于有了 idx_brand 索引，此查询会走索引覆盖，不再扫描 11k 行)
    const totalResult = await context.env.DB.prepare(
      "SELECT COUNT(DISTINCT brand) as total FROM phone_models",
    ).first();
    const total = (totalResult?.total as number) || 0;

    // 2. 获取分页数据
    // 优化点：因为有了索引，GROUP BY 的效率会大幅提升。
    // 我们手动指定从索引字段拿数据，让 SQL 引擎更聪明一点。
    const { results } = await context.env.DB.prepare(
      `SELECT brand, MAX(brand_title) as brand_title, COUNT(*) as count 
       FROM phone_models 
       GROUP BY brand 
       ORDER BY count DESC 
       LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all();

    return new Response(
      JSON.stringify({ success: true, page, limit, total, results }),
      {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
