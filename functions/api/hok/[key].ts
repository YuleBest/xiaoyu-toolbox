import { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  HOK_DATA: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // 从动态路由参数 [key] 中获取 key
  const key = context.params.key as string;

  const corsHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // 1. 检查 KV 是否绑定成功
    if (!context.env.HOK_DATA) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "KV 绑定未就绪，请检查 wrangler.toml",
        }),
        { status: 500, headers: corsHeaders },
      );
    }

    // 2. 从 KV 读取数据
    const value = await context.env.HOK_DATA.get(key);

    if (value === null) {
      return new Response(
        JSON.stringify({ ok: false, message: `未找到 [${key}] 相关数据` }),
        { status: 404, headers: corsHeaders },
      );
    }

    // 3. 直接返回 KV 里的 JSON 字符串
    return new Response(value, { headers: corsHeaders });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: `服务器开小差了: ${error.message}`,
      }),
      { status: 500, headers: corsHeaders },
    );
  }
};
