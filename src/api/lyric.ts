import request from "./request";

const LYRIC_API = "https://lyric.api.yule.ink";

export interface Song {
  title: string;
  artist: string;
  album: string;
  hash: string;
  duration: number;
}

export interface LyricLine {
  time: string;
  text: string;
}

export interface LyricMetadata {
  ar?: string; // artist
  ti?: string; // title
  al?: string; // album
  by?: string; // lyricist
  [key: string]: string | undefined;
}

export interface LyricJsonResponse {
  info: LyricMetadata;
  lyrics: LyricLine[];
}

/**
 * 搜索歌曲
 */
export async function searchSongs(keyword: string): Promise<Song[]> {
  const { data } = await request.get<Song[]>(`${LYRIC_API}/search`, {
    params: { keyword },
  });
  return data;
}

/**
 * 获取歌词（JSON 格式，已解析）
 */
export async function getLyricJson(hash: string): Promise<LyricJsonResponse> {
  const { data } = await request.get<LyricJsonResponse>(`${LYRIC_API}/lyric`, {
    params: { hash, format: "json" },
  });
  return data;
}

/**
 * 获取歌词（原始 LRC 文本）
 */
export async function getLyricLrc(hash: string): Promise<string> {
  const { data } = await request.get<string>(`${LYRIC_API}/lyric`, {
    params: { hash },
    responseType: "text",
    transformResponse: [(data) => data], // prevent JSON parsing
  });
  return data;
}
