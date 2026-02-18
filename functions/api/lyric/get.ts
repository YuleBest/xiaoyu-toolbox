// 根据 hash 获取歌词

import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const hash = searchParams.get("hash");
  const format = searchParams.get("format") || "lrc";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (!hash) {
    return new Response(
      JSON.stringify({ error: "没有 Hash 我也变不出歌词呀" }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const lyricUrl = `http://m.kugou.com/app/i/krc.php?cmd=100&hash=${hash}&timelength=300000`;

  try {
    const res = await fetch(lyricUrl);
    let text = await res.text();
    text = text.replace(/^\ufeff/, ""); // 清理 BOM

    if (format === "json") {
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const jsonResult: any = { info: {}, lyrics: [] };

      lines.forEach((line) => {
        const infoMatch = line.match(
          /\[(ar|ti|al|by|hash|sign|qq|total|offset|id):(.*)\]/i,
        );
        if (infoMatch) {
          jsonResult.info[infoMatch[1].toLowerCase()] = infoMatch[2].trim();
          return;
        }
        const lyricMatch = line.match(/\[(\d+:\d+\.\d+)\](.*)/);
        if (lyricMatch) {
          jsonResult.lyrics.push({
            time: lyricMatch[1],
            text: lyricMatch[2].trim(),
          });
        }
      });
      return new Response(JSON.stringify(jsonResult), { headers: corsHeaders });
    }

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "获取歌词失败" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
