import request from "./request";

const API_PREFIX = "/api/bilidown";

// 1. 补全 VideoStream 类型
export interface VideoStream {
  quality: number;
  qualityDesc: string;
  displayDesc: string;
  url: string;
  codecs: string;
  bandwidth: number;
  downloadUrl: string;
}

// 2. 补全 AudioStream 类型
export interface AudioStream {
  id: number;
  url: string;
  bandwidth: number;
  codecs: string;
  downloadUrl: string;
}

// 3. 补全 BiliParseResult 类型 (对应后端 data 字段)
export interface BiliParseResult {
  bvid: string;
  cid: number;
  title: string;
  duration: number;
  videoStreams: VideoStream[];
  audioStreams: AudioStream[];
}

// 对应整个解析响应
export interface BiliParseResponse {
  ok: boolean;
  message?: string;
  data?: BiliParseResult;
}

/**
 * 解析 B 站视频
 */
export async function parseBiliVideo(
  bvid: string,
  cookie?: string,
): Promise<BiliParseResponse> {
  const { data } = await request.get<BiliParseResponse>(`${API_PREFIX}/parse`, {
    params: { bvid, cookie },
  });
  return data;
}

/**
 * 4. 补全 getDownloadUrl 函数
 * 因为后端返回的 downloadUrl 已经是 "/api/bili/download?..." 的相对路径
 * 这里直接返回即可，或者加上自定义文件名的逻辑
 */
export function getDownloadUrl(originalUrl: string, filename?: string): string {
  if (!filename) return originalUrl;
  return `${originalUrl}&filename=${encodeURIComponent(filename)}`;
}
