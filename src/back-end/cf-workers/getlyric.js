export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    };

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

      const results = (data.data?.info || []).map((item) => ({
        title: item.songname,
        artist: item.singername,
        album: item.album_name,
        hash: item.hash,
        duration: item.duration,
      }));

      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    if (pathname === "/lyric") {
      const hash = searchParams.get("hash");
      const format = searchParams.get("format") || "lrc"; // 默认 lrc
      if (!hash)
        return new Response(
          JSON.stringify({ error: "没有 Hash 我也变不出歌词呀" }),
          { status: 400, headers: corsHeaders },
        );

      const lyricUrl = `http://m.kugou.com/app/i/krc.php?cmd=100&hash=${hash}&timelength=300000`;
      const res = await fetch(lyricUrl);
      let text = await res.text();
      text = text.replace(/^\ufeff/, ""); // 清理 BOM

      if (format === "json") {
        // 先把文本按行切分，并去掉每一行前后的空白字符（解决 \r 导致的问题）
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        const jsonResult = {
          info: {},
          lyrics: [],
        };

        lines.forEach((line) => {
          // 1. 匹配元数据 [key:value]
          // 改进：不再强制 ^ 和 $，只要包含就拿出来
          const infoMatch = line.match(
            /\[(ar|ti|al|by|hash|sign|qq|total|offset|id):(.*)\]/i,
          );
          if (infoMatch) {
            jsonResult.info[infoMatch[1].toLowerCase()] = infoMatch[2].trim();
            return;
          }

          // 2. 匹配时间轴 [00:00.00]内容
          // 改进：秒数后面可能有一位、两位或三位小数，用 \d+ 搞定
          const lyricMatch = line.match(/\[(\d+:\d+\.\d+)\](.*)/);
          if (lyricMatch) {
            jsonResult.lyrics.push({
              time: lyricMatch[1],
              text: lyricMatch[2].trim(),
            });
          }
        });

        return new Response(JSON.stringify(jsonResult), {
          headers: corsHeaders,
        });
      }

      // 默认返回纯文本 LRC
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=604800",
        },
      });
    }

    return new Response("Not Found. Try /search or /lyric", { status: 404 });
  },
};
