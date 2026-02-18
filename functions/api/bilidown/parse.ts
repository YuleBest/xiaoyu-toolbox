import { PagesFunction } from "@cloudflare/workers-types";

// 辅助函数：质量描述字典
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
    48: "720P 高清",
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
      JSON.stringify({ ok: false, message: "非法的 BV 号格式" }),
      { status: 400, headers: corsHeaders },
    ) as any;
  }

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  try {
    // 1. 获取视频分页列表和基础信息
    const pageListResp = await fetch(
      `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`,
      { headers: { "User-Agent": ua } },
    );
    const pageListData: any = await pageListResp.json();

    if (!pageListData.data?.[0]) {
      return new Response(
        JSON.stringify({ ok: false, message: "未找到视频信息" }),
        { status: 400, headers: corsHeaders },
      ) as any;
    }

    // 提取组件需要的字段：cid, title, duration, cover
    const videoInfo = pageListData.data[0];
    const cid = videoInfo.cid;
    const title = videoInfo.part || "未知标题";
    const duration = videoInfo.duration || 0;
    const cover = videoInfo.first_frame || ""; // 对应报错中的 cover

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

    if (!dash) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "无法解析 DASH 数据，请检查 Cookie 是否有效",
        }),
        { status: 400, headers: corsHeaders },
      ) as any;
    }

    // 3. 组装数据，对齐 Vue 组件的字段
    const supportFormats = playUrlData.data.support_formats || [];
    const supportMap = new Map(supportFormats.map((f: any) => [f.quality, f]));

    // --- 视频流：补全 width, height, superscript ---
    const videoStreams = dash.video.map((v: any) => {
      const supportInfo = supportMap.get(v.id);
      return {
        quality: v.id,
        qualityDesc:
          (supportInfo as any)?.new_description || getQualityDesc(v.id),
        displayDesc: (supportInfo as any)?.display_desc || "",
        superscript: (supportInfo as any)?.superscript || "",
        url: v.baseUrl || v.base_url,
        width: v.width,
        height: v.height,
        codecs: v.codecs,
        bandwidth: v.bandwidth,
        downloadUrl: `/api/bili/download?type=video&url=${encodeURIComponent(v.baseUrl || v.base_url)}`,
      };
    });

    // --- 音频流：补全 quality (对应 id) ---
    const audioStreams = dash.audio.map((a: any) => ({
      id: a.id,
      quality: a.id, // 组件里有些地方在判断 audio.quality
      url: a.baseUrl || a.base_url,
      bandwidth: a.bandwidth,
      codecs: a.codecs,
      downloadUrl: `/api/bili/download?type=audio&url=${encodeURIComponent(a.baseUrl || a.base_url)}`,
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          bvid,
          cid,
          title,
          cover, // 封面图
          duration,
          videoStreams,
          audioStreams,
        },
      }),
      { headers: corsHeaders },
    ) as any;
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: `服务器内部错误: ${error.message}`,
      }),
      { status: 500, headers: corsHeaders },
    ) as any;
  }
};
