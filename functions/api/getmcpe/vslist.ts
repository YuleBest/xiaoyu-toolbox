import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (_context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  const targetUrl = "https://mcapks.net/api/get-vslist.php";

  try {
    const res = await fetch(targetUrl);

    // 如果上游返回的不是 200，我们可以直接穿透返回，或者包装一下
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
