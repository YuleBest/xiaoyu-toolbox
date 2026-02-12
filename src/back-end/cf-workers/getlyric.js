export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    };

    // 1. 搜索部分：根据关键词找歌
    if (pathname === "/search") {
      const keyword = searchParams.get("keyword");
      if (!keyword)
        return new Response(JSON.stringify({ error: "传个关键词呀，于乐" }), {
          status: 400,
          headers: corsHeaders,
        });

      const searchUrl = `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(keyword)}&page=1&pagesize=5`;
      const res = await fetch(searchUrl);
      const data = await res.json();

      // 简化返回的数据，只给前端需要的部分
      const results = (data.data?.info || []).map((item) => ({
        title: item.songname,
        artist: item.singername,
        album: item.album_name,
        hash: item.hash,
        duration: item.duration,
      }));

      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 2. 获取歌词部分：根据 Hash 拿文本
    if (pathname === "/lyric") {
      const hash = searchParams.get("hash");
      if (!hash)
        return new Response(
          JSON.stringify({ error: "没有 Hash 我也变不出歌词呀" }),
          { status: 400, headers: corsHeaders },
        );

      const lyricUrl = `http://m.kugou.com/app/i/krc.php?cmd=100&hash=${hash}&timelength=300000`;
      const res = await fetch(lyricUrl);

      let text = await res.text();
      text = text.replace(/^\ufeff/, ""); // 清理 BOM

      // 返回纯文本 LRC，方便播放器直接使用
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=604800", // 歌词一般不变，直接缓存一周
        },
      });
    }

    // 默认返回 404
    return new Response("Not Found. Try /search or /lyric", { status: 404 });
  },
};
