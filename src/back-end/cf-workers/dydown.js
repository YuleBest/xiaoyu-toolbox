export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/parse") {
      return handleParse(url);
    }

    if (url.pathname === "/api/download") {
      return handleDownload(url);
    }

    if (url.pathname === "/api/preview") {
      return handlePreview(url);
    }

    return new Response("Not Found", { status: 404 });
  },
};

// ==================== /api/parse ====================
async function handleParse(url) {
  const shortUrl = url.searchParams.get("url");

  if (!shortUrl) {
    return json({ ok: false, message: "缺少参数 url" }, 400);
  }

  if (!shortUrl.startsWith("https://v.douyin.com/")) {
    return json({ ok: false, message: "非法的抖音短链接" }, 400);
  }

  const ua =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 " +
    "Mobile/15E148 Safari/604.1";

  // 请求短链并跟随跳转
  const resp = await fetch(shortUrl, {
    headers: { "User-Agent": ua },
    redirect: "follow",
  });

  const html = await resp.text();

  const videoId = html.match(/video_id=([a-zA-Z0-9]+)/)?.[1];
  const nickname = html.match(/"nickname":"([^"]+)"/)?.[1];
  const createTs = html.match(/"create_time":(\d+)/)?.[1];
  const commentCount = html.match(/"comment_count":(\d+)/)?.[1];
  const diggCount = html.match(/"digg_count":(\d+)/)?.[1];
  const shareCount = html.match(/"share_count":(\d+)/)?.[1];

  if (!videoId || !nickname || !createTs) {
    return json(
      {
        ok: false,
        message: "解析失败，可能是图集、动态照片或页面结构变化",
      },
      400,
    );
  }

  const createTime = formatTime(Number(createTs));
  const safeNickname = nickname.replace(/[/:*?"<>|]/g, "");

  return json({
    ok: true,
    data: {
      videoId,
      nickname,
      safeNickname,
      createTime,
      statistics: {
        commentCount: Number(commentCount || 0),
        diggCount: Number(diggCount || 0),
        shareCount: Number(shareCount || 0),
      },
      downloadApi:
        `/api/download?videoId=${videoId}` +
        `&filename=${encodeURIComponent(`${createTime}_${safeNickname}.mp4`)}`,
    },
  });
}

// ==================== /api/preview ====================
async function handlePreview(url) {
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return new Response("Missing videoId", { status: 400 });
  }

  const playUrl =
    `https://www.iesdouyin.com/aweme/v1/play/` +
    `?video_id=${videoId}&ratio=1080p&line=0`;

  const upstream = await fetch(playUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", "video/mp4");
  headers.set("Access-Control-Allow-Origin", "*");
  // 注意：不设置 attachment
  headers.set("Content-Disposition", "inline");

  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);

  return new Response(upstream.body, { headers });
}

// ==================== /api/download ====================
async function handleDownload(url) {
  const videoId = url.searchParams.get("videoId");
  const filename = url.searchParams.get("filename") || "douyin.mp4";

  if (!videoId) {
    return new Response("Missing videoId", { status: 400 });
  }

  const playUrl =
    `https://www.iesdouyin.com/aweme/v1/play/` +
    `?video_id=${videoId}&ratio=1080p&line=0`;

  const upstream = await fetch(playUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", "video/mp4");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Access-Control-Allow-Origin", "*");

  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);

  return new Response(upstream.body, { headers });
}

// ==================== helpers ====================
function formatTime(ts) {
  const d = new Date(ts * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
