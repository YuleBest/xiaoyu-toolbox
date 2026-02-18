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
    // 获取去重后的品牌列表
    const { results } = await context.env.DB.prepare(
      "SELECT brand, brand_title, COUNT(*) as count FROM phone_models GROUP BY brand ORDER BY count DESC",
    ).all();

    return new Response(JSON.stringify({ success: true, results }), {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=86400", // 品牌列表这种不常变的，缓存一天
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
