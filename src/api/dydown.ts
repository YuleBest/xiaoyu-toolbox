const API_PREFIX = "/api/dydown";

export interface DyVideoResult {
  videoId: string;
  nickname: string;
  safeNickname: string;
  createTime: string;
  downloadApi: string;
  previewApi: string;
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
 * 提取抖音短链
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
 * 使用原生 fetch，确保解析过程最轻量
 */
export async function parseDyVideo(input: string): Promise<DyParseResponse> {
  const shortUrl = extractShortUrl(input);
  if (!shortUrl) {
    return { ok: false, message: "未识别到有效的抖音短链接" };
  }

  try {
    const url = `${API_PREFIX}/parse?url=${encodeURIComponent(shortUrl)}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      return { ok: false, message: `服务器响应异常: ${resp.status}` };
    }

    return await resp.json();
  } catch (error) {
    console.error("[Parse Error]", error);
    return { ok: false, message: "解析服务请求失败，请检查网络" };
  }
}

/**
 * 获取完整下载链接
 * 后端返回的 downloadApi 已经是 "/api/video/download?..."
 */
export function getDownloadUrl(downloadApi: string): string {
  return downloadApi;
}

/**
 * 获取预览链接
 */
export function getPreviewUrl(videoId: string): string {
  return `${API_PREFIX}/preview?videoId=${videoId}`;
}
