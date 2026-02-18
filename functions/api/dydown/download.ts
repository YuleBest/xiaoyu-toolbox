import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const videoId = searchParams.get("videoId");
  const filename = searchParams.get("filename") || "douyin.mp4";

  if (!videoId) return new Response("Missing videoId", { status: 400 });

  const playUrl = `https://www.iesdouyin.com/aweme/v1/play/?video_id=${videoId}&ratio=1080p&line=0`;

  const upstream = await fetch(playUrl, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!upstream.ok)
    return new Response("抖音源站错误", { status: upstream.status });

  const headers = new Headers(upstream.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Content-Type", "video/mp4");
  // 核心：强制下载
  headers.set(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(filename)}"`,
  );

  return new Response(upstream.body, { headers });
};
