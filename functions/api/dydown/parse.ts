import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const shortUrl = searchParams.get("url");

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  };

  if (!shortUrl || !shortUrl.startsWith("https://v.douyin.com/")) {
    return new Response(
      JSON.stringify({ ok: false, message: "非法或缺少 url" }),
      { status: 400, headers },
    );
  }

  const ua =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

  try {
    const resp = await fetch(shortUrl, {
      headers: { "User-Agent": ua },
      redirect: "follow",
    });
    const html = await resp.text();

    const videoId = html.match(/video_id=([a-zA-Z0-9]+)/)?.[1];
    const nickname = html.match(/"nickname":"([^"]+)"/)?.[1];
    const createTs = html.match(/"create_time":(\d+)/)?.[1];

    // 匹配统计数据
    const commentCount = html.match(/"comment_count":(\d+)/)?.[1];
    const diggCount = html.match(/"digg_count":(\d+)/)?.[1];
    const shareCount = html.match(/"share_count":(\d+)/)?.[1];

    if (!videoId || !nickname || !createTs) {
      return new Response(
        JSON.stringify({ ok: false, message: "解析失败，页面结构可能已变" }),
        { status: 400, headers },
      );
    }

    const d = new Date(Number(createTs) * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const createTime = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const safeNickname = nickname.replace(/[/:*?"<>|]/g, "");

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          videoId,
          nickname,
          createTime,
          statistics: {
            commentCount: Number(commentCount || 0),
            diggCount: Number(diggCount || 0),
            shareCount: Number(shareCount || 0),
          },
          // 注意：这里的下载地址也要同步更新为新的路径
          downloadApi: `/api/video/download?videoId=${videoId}&filename=${encodeURIComponent(`${createTime}_${safeNickname}.mp4`)}`,
          previewApi: `/api/video/preview?videoId=${videoId}`,
        },
      }),
      { headers },
    );
  } catch {
    return new Response(
      JSON.stringify({ ok: false, message: "服务端请求异常" }),
      { status: 500, headers },
    );
  }
};
