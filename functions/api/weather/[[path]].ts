import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  QWEATHER_API_HOST: string;
  QWEATHER_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params, request, env } = context;

  const pathArr = params.path as string[];
  if (!pathArr || pathArr.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  const path = pathArr.join("/");
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  // Append HeFeng API Key
  if (env.QWEATHER_API_KEY) {
    searchParams.set("key", env.QWEATHER_API_KEY);
  } else {
    return new Response(JSON.stringify({ error: "Missing QWEATHER_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const host = env.QWEATHER_API_HOST || "api.qweather.com";
  const upstreamUrl = `https://${host}/${path}?${searchParams.toString()}`;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Xiaoyu-Toolbox Proxy",
      },
    });

    const data = await upstreamResponse.text();

    return new Response(data, {
      status: upstreamResponse.status,
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
        message: `Weather API Proxy error: ${err.message}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders,
        },
      }
    );
  }
};
