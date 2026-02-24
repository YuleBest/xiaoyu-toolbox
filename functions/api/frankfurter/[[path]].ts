import { PagesFunction } from "@cloudflare/workers-types";

/**
 * Frankfurter API Proxy
 * Handles requests to https://api.frankfurter.dev/v1/
 */
export const onRequest: PagesFunction = async (context) => {
  const { params, request } = context;

  // Get the path from the wildcard parameter
  // If no path is provided, default to 'latest'
  const pathArr = params.path as string[];
  const path = pathArr && pathArr.length > 0 ? pathArr.join("/") : "latest";

  const url = new URL(request.url);
  const search = url.search;

  const upstreamUrl = `https://api.frankfurter.dev/v1/${path}${search}`;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Xiaoyu-Toolbox Proxy",
      },
    });

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
        message: `Frankfurter 代理请求失败: ${err.message}`,
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
