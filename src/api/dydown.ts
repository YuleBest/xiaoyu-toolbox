const API_BASE = "https://dydown.api.yule.ink";

export interface DyVideoResult {
  videoId: string;
  safeNickname: string;
  createTime: string;
  downloadApi: string;
  statistics?: {
    diggCount: number;
    commentCount: number;
    shareCount: number;
  };
}

export interface DyParseResponse {
  ok: boolean;
  message?: string;
  data?: DyVideoResult;
}

/**
 * 从用户粘贴的文本中提取抖音短链
 */
function extractShortUrl(text: string): string | null {
  if (!text) return null;
  const cleaned = text
    .normalize("NFKC")
    .replace(/\u200B|\uFEFF/g, "")
    .trim();
  const match = cleaned.match(/https:\/\/v\.douyin\.com\/\S+/);
  return match ? match[0] : null;
}

/**
 * 解析抖音视频
 */
export async function parseDyVideo(input: string): Promise<DyParseResponse> {
  const shortUrl = extractShortUrl(input);
  if (!shortUrl) {
    return { ok: false, message: "未识别到有效的抖音短链接" };
  }
  const resp = await fetch(
    `${API_BASE}/api/parse?url=${encodeURIComponent(shortUrl)}`,
  );
  return resp.json();
}

/**
 * 获取完整下载链接
 */
export function getDownloadUrl(downloadApi: string): string {
  return `${API_BASE}${downloadApi}`;
}

/**
 * 获取预览链接
 */
export function getPreviewUrl(videoId: string): string {
  return `${API_BASE}/api/preview?videoId=${videoId}`;
}
