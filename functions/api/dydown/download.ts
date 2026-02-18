import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const videoId = searchParams.get("videoId");
  // 如果传了 filename 就用传的，没传就默认 douyin.mp4
  const filename = searchParams.get("filename") || "douyin.mp4";

  if (!videoId) return new Response("Missing videoId", { status: 400 }) as any;

  const playUrl = `https://www.iesdouyin.com/aweme/v1/play/?video_id=${videoId}&ratio=1080p&line=0`;

  const upstream = await fetch(playUrl, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!upstream.ok)
    return new Response("抖音源站错误", { status: upstream.status }) as any;

  const headers = new Headers();

  // 基础跨域和类型设置
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Content-Type", "video/mp4");

  // 处理中文文件名和特殊字符，防止浏览器默认抓取路径名（preview）
  const safeFilename = encodeURIComponent(filename);

  headers.set(
    "Content-Disposition",
    `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
  );
  // 顺便透传文件大小，让浏览器下载时显示进度条
  const contentLength = upstream.headers.get("Content-Length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(upstream.body, { headers }) as any;
};
