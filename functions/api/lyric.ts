// 定义接口返回的 JSON 结构，写代码时有提示更爽
interface LyricInfo {
  [key: string]: string;
}

interface LyricLine {
  time: string;
  text: string;
}

interface JsonResult {
  info: LyricInfo;
  lyrics: LyricLine[];
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const { searchParams } = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const hash = searchParams.get("hash");
  const format = searchParams.get("format") || "lrc";

  if (!hash) {
    return new Response(
      JSON.stringify({ error: "没有 Hash 我也变不出歌词呀" }),
      { status: 400, headers: corsHeaders },
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

      const jsonResult: JsonResult = {
        info: {},
        lyrics: [],
      };

      lines.forEach((line) => {
        // 匹配元数据 [key:value]
        const infoMatch = line.match(
          /\[(ar|ti|al|by|hash|sign|qq|total|offset|id):(.*)\]/i,
        );
        if (infoMatch) {
          jsonResult.info[infoMatch[1].toLowerCase()] = infoMatch[2].trim();
          return;
        }

        // 匹配时间轴 [00:00.00]内容
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
    return new Response(JSON.stringify({ error: "请求酷狗接口失败了" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
