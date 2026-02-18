import { PagesFunction } from "@cloudflare/workers-types";

// 辅助函数：质量描述
const getQualityDesc = (quality: number) => {
  const qualityMap: Record<number, string> = {
    127: "8K 超高清",
    126: "杜比视界",
    125: "HDR 真彩",
    120: "4K 超清",
    116: "1080P 60帧",
    112: "1080P 高码率",
    80: "1080P 高清",
    74: "720P 60帧",
    64: "720P 高清",
    32: "480P 清晰",
    16: "360P 流畅",
  };
  return qualityMap[quality] || `${quality}P`;
};

const corsHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const bvid = searchParams.get("bvid");
  const cookie = searchParams.get("cookie") || "";

  if (!bvid || !bvid.match(/^BV[a-zA-Z0-9]+$/)) {
    return new Response(
      JSON.stringify({ ok: false, message: "非法的 BV 号" }),
      { status: 400, headers: corsHeaders },
    );
  }

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  try {
    // 1. 获取 CID
    const pageListResp = await fetch(
      `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`,
      { headers: { "User-Agent": ua } },
    );
    const pageListData: any = await pageListResp.json();
    if (!pageListData.data?.[0])
      return new Response(
        JSON.stringify({ ok: false, message: "未找到视频信息" }),
        { status: 400, headers: corsHeaders },
      );

    const { cid, part: title, duration } = pageListData.data[0];

    // 2. 获取播放链接 (DASH 模式)
    const playUrlApi = `https://api.bilibili.com/x/player/playurl?fnval=80&cid=${cid}&bvid=${bvid}`;
    const playHeaders: Record<string, string> = {
      Referer: "https://www.bilibili.com/",
      "User-Agent": ua,
    };
    if (cookie) playHeaders.Cookie = cookie;

    const playUrlResp = await fetch(playUrlApi, { headers: playHeaders });
    const playUrlData: any = await playUrlResp.json();
    const dash = playUrlData.data?.dash;

    if (!dash)
      return new Response(
        JSON.stringify({ ok: false, message: "无法解析 DASH 数据" }),
        { status: 400, headers: corsHeaders },
      );

    // 3. 组装视频流和音频流
    const supportFormats = playUrlData.data.support_formats || [];
    const supportMap = new Map(supportFormats.map((f: any) => [f.quality, f]));

    // --- 视频流处理 ---
    const videoStreams = dash.video.map((v: any) => {
      const supportInfo = supportMap.get(v.id);
      return {
        quality: v.id,
        qualityDesc: supportInfo?.new_description || getQualityDesc(v.id),
        displayDesc: supportInfo?.display_desc || "",
        url: v.baseUrl || v.base_url,
        codecs: v.codecs,
        bandwidth: v.bandwidth,
        downloadUrl: `/api/bili/download?type=video&url=${encodeURIComponent(v.baseUrl || v.base_url)}`,
      };
    });

    // --- 音频流处理 ---
    const audioStreams = dash.audio.map((a: any) => ({
      id: a.id,
      url: a.baseUrl || a.base_url,
      bandwidth: a.bandwidth,
      codecs: a.codecs,
      downloadUrl: `/api/bili/download?type=audio&url=${encodeURIComponent(a.baseUrl || a.base_url)}`,
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        data: { bvid, cid, title, duration, videoStreams, audioStreams },
      }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
