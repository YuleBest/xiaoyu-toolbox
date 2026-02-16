export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    // 先尝试获取静态资源
    let response = await env.ASSETS.fetch(request);

    // SPA fallback
    if (response.status === 404 && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(new URL("/", request.url)));
    }

    return response;
  },
};
