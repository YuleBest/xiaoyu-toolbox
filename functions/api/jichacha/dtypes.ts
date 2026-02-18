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
    const { results } = await context.env.DB.prepare(
      "SELECT dtype, COUNT(*) as count FROM phone_models GROUP BY dtype ORDER BY count DESC",
    ).all();

    return new Response(JSON.stringify({ success: true, results }), {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=86400", // 很少变动，缓存久一点
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
