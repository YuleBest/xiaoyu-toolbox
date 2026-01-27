export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/parse") {
      return handleParse(url);
    }

    if (url.pathname === "/api/download") {
      return handleDownload(url);
    }

    return new Response("Not Found", { status: 404 });
  },
};

// ==================== /api/parse ====================
async function handleParse(url) {
  const bvid = url.searchParams.get("bvid");
  const cookie = url.searchParams.get("cookie") || "";

  if (!bvid) {
    return json({ ok: false, message: "缺少参数 bvid" }, 400);
  }

  // 验证 BV 号格式
  if (!bvid.match(/^BV[a-zA-Z0-9]+$/)) {
    return json({ ok: false, message: "非法的 BV 号格式" }, 400);
  }

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/126.0.0.0 " +
    "Safari/537.36";

  try {
    // 第一步：获取视频的 cid
    const pageListUrl = `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`;
    const pageListResp = await fetch(pageListUrl, {
      headers: { "User-Agent": ua },
    });

    const pageListData = await pageListResp.json();

    // if (pageListData.code !== 0 || pageListData.message !== "0") {
    //   return json(
    //     {
    //       ok: false,
    //       message: `获取视频信息失败: ${pageListData.message}`,
    //     },
    //     400,
    //   );
    // }

    if (!pageListData.data || pageListData.data.length === 0) {
      return json({ ok: false, message: "未找到视频信息" }, 400);
    }

    const videoInfo = pageListData.data[0];
    const cid = videoInfo.cid;
    const title = videoInfo.part || "未知标题";
    const cover = videoInfo.first_frame || "";
    const duration = videoInfo.duration || 0;
    const dimension = videoInfo.dimension || {};

    // 第二步：获取视频播放链接
    const playUrlApi = `https://api.bilibili.com/x/player/playurl?fnval=80&cid=${cid}&bvid=${bvid}`;
    const headers = {
      Referer: "https://www.bilibili.com/",
      "User-Agent": ua,
    };

    if (cookie) {
      headers.Cookie = cookie;
    }

    const playUrlResp = await fetch(playUrlApi, { headers });
    const playUrlData = await playUrlResp.json();

    // if (playUrlData.code !== 0 || playUrlData.message !== "0") {
    //   return json(
    //     {
    //       ok: false,
    //       message: `获取播放链接失败: ${playUrlData.message}`,
    //     },
    //     400,
    //   );
    // }

    const data = playUrlData.data;

    if (!data.dash || !data.dash.video || !data.dash.audio) {
      return json(
        {
          ok: false,
          message: "视频数据格式异常,无法解析",
        },
        400,
      );
    }

    // 解析视频清晰度列表
    const videoStreams = parseVideoStreams(
      data.dash.video,
      data.support_formats,
    );
    const audioStreams = parseAudioStreams(data.dash.audio);

    // 获取最高清晰度信息
    const maxQuality = videoStreams.length > 0 ? videoStreams[0].quality : 0;
    const hasHighQuality = maxQuality >= 63; // 720P 及以上

    return json({
      ok: true,
      data: {
        bvid,
        cid,
        title,
        cover,
        duration,
        dimension,
        hasCookie: !!cookie,
        hasHighQuality,
        maxQuality,
        videoStreams,
        audioStreams,
      },
    });
  } catch (error) {
    return json(
      {
        ok: false,
        message: `解析失败: ${error.message}`,
      },
      500,
    );
  }
}

// ==================== /api/download ====================
async function handleDownload(url) {
  const downloadUrl = url.searchParams.get("url");
  const filename = url.searchParams.get("filename") || "bilibili_video.m4s";
  const type = url.searchParams.get("type") || "video"; // video 或 audio

  if (!downloadUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const upstream = await fetch(downloadUrl, {
      redirect: "follow",
      headers: {
        Referer: "https://www.bilibili.com/",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!upstream.ok) {
      return new Response("Upstream error", { status: upstream.status });
    }

    const headers = new Headers();
    const contentType = type === "audio" ? "audio/mp4" : "video/mp4";
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Access-Control-Allow-Origin", "*");

    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);

    return new Response(upstream.body, { headers });
  } catch (error) {
    return new Response(`Download error: ${error.message}`, { status: 500 });
  }
}

// ==================== helpers ====================

/**
 * 解析视频流信息
 */
function parseVideoStreams(videoList, supportFormats) {
  // 按清晰度分组(同一清晰度可能有多个编码)
  const qualityMap = new Map();

  videoList.forEach((video) => {
    const quality = video.id;
    if (!qualityMap.has(quality)) {
      qualityMap.set(quality, []);
    }
    qualityMap.get(quality).push(video);
  });

  // 构建清晰度列表
  const streams = [];
  const supportMap = new Map(supportFormats.map((f) => [f.quality, f]));

  // 按清晰度从高到低排序
  const sortedQualities = Array.from(qualityMap.keys()).sort((a, b) => b - a);

  sortedQualities.forEach((quality) => {
    const videos = qualityMap.get(quality);
    const supportInfo = supportMap.get(quality);

    // 选择第一个视频流(通常是最优的)
    const video = videos[0];

    streams.push({
      quality,
      qualityDesc: supportInfo?.new_description || getQualityDesc(quality),
      displayDesc: supportInfo?.display_desc || getQualityDesc(quality),
      superscript: supportInfo?.superscript || "",
      url: video.baseUrl || video.base_url,
      width: video.width,
      height: video.height,
      frameRate: video.frameRate || video.frame_rate,
      codecs: video.codecs,
      bandwidth: video.bandwidth,
      size: estimateSize(video.bandwidth, 0), // 需要视频时长才能准确计算
    });
  });

  return streams;
}

/**
 * 解析音频流信息
 */
function parseAudioStreams(audioList) {
  const streams = [];

  audioList.forEach((audio, index) => {
    streams.push({
      id: audio.id,
      quality: getAudioQualityDesc(audio.id),
      url: audio.baseUrl || audio.base_url,
      codecs: audio.codecs,
      bandwidth: audio.bandwidth,
      size: estimateSize(audio.bandwidth, 0),
    });
  });

  // 按带宽从高到低排序
  streams.sort((a, b) => b.bandwidth - a.bandwidth);

  return streams;
}

/**
 * 获取清晰度描述
 */
function getQualityDesc(quality) {
  const qualityMap = {
    127: "8K 超高清",
    126: "杜比视界",
    125: "HDR 真彩",
    120: "4K 超清",
    116: "1080P 60帧",
    112: "1080P 高码率",
    80: "1080P 高清",
    74: "720P 60帧",
    64: "720P 高清",
    48: "720P 高清",
    32: "480P 清晰",
    16: "360P 流畅",
  };
  return qualityMap[quality] || `${quality}P`;
}

/**
 * 获取音频质量描述
 */
function getAudioQualityDesc(id) {
  const audioMap = {
    30280: "高品质音频",
    30232: "中等音频",
    30216: "标准音频",
  };
  return audioMap[id] || "音频";
}

/**
 * 估算文件大小(字节)
 */
function estimateSize(bandwidth, duration) {
  if (!duration) return 0;
  return Math.floor((bandwidth * duration) / 8);
}

/**
 * 返回 JSON 响应
 */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
