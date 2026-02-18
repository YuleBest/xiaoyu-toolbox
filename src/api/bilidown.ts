import request from "./request";
const API_PREFIX = "/api/bilidown";

export interface VideoStream {
  quality: number;
  qualityDesc: string;
  displayDesc: string;
  superscript: string;
  url: string;
  width: number;
  height: number;
  codecs: string;
  bandwidth: number;
  downloadUrl: string;
}

export interface AudioStream {
  id: number;
  quality: number;
  url: string;
  bandwidth: number;
  codecs: string;
  downloadUrl: string;
}

export interface BiliParseResult {
  bvid: string;
  cid: number;
  title: string;
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

export async function parseBiliVideo(
  bvid: string,
  cookie?: string,
): Promise<BiliParseResponse> {
  const { data } = await request.get<BiliParseResponse>(`${API_PREFIX}/parse`, {
    params: { bvid, cookie },
  });
  return data;
}

export function getDownloadUrl(
  downloadApi: string,
  filename: string,
  type: string = "video",
): string {
  return `${downloadApi}&filename=${encodeURIComponent(filename)}&type=${type}`;
}
