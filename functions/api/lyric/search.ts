// 根据关键词搜索歌曲，获得 hash

import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const keyword = searchParams.get("keyword");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (!keyword) {
    return new Response(JSON.stringify({ error: "传个关键词呀，于乐" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const searchUrl = `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(keyword)}&page=1&pagesize=5`;

  try {
    const res = await fetch(searchUrl);
    const data: any = await res.json();

    const results = (data.data?.info || []).map((item: any) => ({
      title: item.songname,
      artist: item.singername,
      album: item.album_name,
      hash: item.hash,
      duration: item.duration,
    }));

    return new Response(JSON.stringify(results), { headers: corsHeaders });
  } catch {
    return new Response(JSON.stringify({ error: "搜索接口请求失败" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
