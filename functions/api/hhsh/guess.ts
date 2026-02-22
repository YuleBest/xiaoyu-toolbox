import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 处理 CORS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, message: "仅支持 POST 请求" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders,
        },
      },
    );
  }

  try {
    const payload = await request.text();

    const response = await fetch(
      "https://lab.magiconch.com/api/nbnhhsh/guess",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      },
    );

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(
      JSON.stringify({
        ok: false,
        message: `服务器代理请求失败: ${err.message}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders,
        },
      },
    );
  }
};
