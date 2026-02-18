import request from "./request";
const API_PREFIX = "/api/lyric";

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
 * 请求路径：/api/lyric/search
 */
export async function searchSongs(keyword: string): Promise<Song[]> {
  const { data } = await request.get<Song[]>(`${API_PREFIX}/search`, {
    params: { keyword },
  });
  return data;
}

/**
 * 获取歌词（JSON 格式，已解析）
 * 请求路径：/api/lyric/get
 */
export async function getLyricJson(hash: string): Promise<LyricJsonResponse> {
  const { data } = await request.get<LyricJsonResponse>(`${API_PREFIX}/get`, {
    params: { hash, format: "json" },
  });
  return data;
}

/**
 * 获取歌词（原始 LRC 文本）
 * 请求路径：/api/lyric/get
 */
export async function getLyricLrc(hash: string): Promise<string> {
  const { data } = await request.get<string>(`${API_PREFIX}/get`, {
    params: { hash },
    responseType: "text",
    transformResponse: [(data) => data], // 防止 Axios 自动尝试将 LRC 文本解析为 JSON
  });
  return data;
}
