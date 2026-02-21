import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const version = searchParams.get("version");
  const type = searchParams.get("type");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (!version) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 400, message: "缺少 version 参数" },
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  let targetUrl = `https://mcapks.net/api/get-download.php?version=${version}`;
  if (type) {
    targetUrl += `&type=${type}`;
  }

  try {
    const res = await fetch(targetUrl);

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: res.status, message: "上游服务器请求失败" },
        }),
        { status: res.status, headers: corsHeaders },
      );
    }

    const data = await res.text();
    return new Response(data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 500, message: `服务器内部错误: ${err.message}` },
      }),
      { status: 500, headers: corsHeaders },
    );
  }
};
