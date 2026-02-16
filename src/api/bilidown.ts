import request from "./request";

const API_BASE = "https://bilidown.api.yule.ink";

export interface VideoStream {
  quality: number;
  qualityDesc: string;
  url: string;
  codecs: string;
  width: number;
  height: number;
  bandwidth: number;
  superscript?: string;
}

export interface AudioStream {
  id: number;
  quality: string;
  url: string;
  codecs: string;
  bandwidth: number;
}

export interface BiliParseResult {
  title: string;
  bvid: string;
  cid: number;
  cover: string;
  duration: number;
  videoStreams: VideoStream[];
  audioStreams: AudioStream[];
}

export interface BiliParseResponse {
  ok: boolean;
  message?: string;
  data?: BiliParseResult;
}

/**
 * 解析B站视频
 */
export async function parseBiliVideo(
  bvid: string,
  cookie?: string,
): Promise<BiliParseResponse> {
  const params: Record<string, string> = { bvid };
  if (cookie) params.cookie = cookie;

  const { data } = await request.get<BiliParseResponse>(
    `${API_BASE}/api/parse`,
    { params },
  );
  return data;
}

/**
 * 获取下载代理地址
 */
export function getDownloadUrl(
  url: string,
  filename: string,
  type: "video" | "audio",
): string {
  return `${API_BASE}/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&type=${type}`;
}
