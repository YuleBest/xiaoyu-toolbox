import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    // 这里的查询语句不变，但因为我们在 Python 脚本里加了 idx_phone_dtype 索引，
    // D1 现在会自动使用索引进行覆盖扫描（Index Only Scan），
    // 读取开销会从全表扫描降到极低。
    const { results } = await context.env.DB.prepare(
      "SELECT dtype, COUNT(*) as count FROM phone_models WHERE dtype IS NOT NULL GROUP BY dtype ORDER BY count DESC",
    ).all();

    return new Response(JSON.stringify({ success: true, results }), {
      headers: {
        ...corsHeaders,
        // 既然数据是爬虫定期更新的，这里的缓存策略非常明智
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
