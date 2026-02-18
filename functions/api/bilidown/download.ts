import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const downloadUrl = searchParams.get("url");
  const type = searchParams.get("type") || "video";
  const filename =
    searchParams.get("filename") ||
    `bili_${Date.now()}.${type === "audio" ? "m4a" : "mp4"}`;

  if (!downloadUrl) return new Response("Missing url", { status: 400 }) as any;

  const upstream = await fetch(downloadUrl, {
    headers: {
      Referer: "https://www.bilibili.com/", // 必须加这个，否则 B 站返回 403
      "User-Agent": "Mozilla/5.0",
    },
  });

  const safeFilename = encodeURIComponent(filename);
  const headers = new Headers();
  headers.set("Content-Type", type === "audio" ? "audio/mp4" : "video/mp4");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
  );

  const len = upstream.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);

  return new Response(upstream.body, { headers }) as any;
};
