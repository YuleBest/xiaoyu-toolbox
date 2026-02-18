import request from "./request";

const API_PREFIX = "/api/bilidown";

export interface BiliStream {
  quality: number;
  qualityDesc: string;
  url: string;
  downloadUrl: string;
}

export interface BiliParseResponse {
  ok: boolean;
  message?: string;
  data?: {
    title: string;
    videoStreams: BiliStream[];
    audioStreams: any[];
  };
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
