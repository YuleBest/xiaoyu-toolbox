export interface McpeVersion {
  version: string;
  beta: boolean;
  date: string;
  size: string;
}

export interface McpeVsListResponse {
  success: boolean;
  data: {
    total: number;
    versions: McpeVersion[];
  };
  message?: string;
}

export interface McpeDownloadLink {
  name: string;
  url: string;
  password?: string;
}

export interface McpeDownloadInfo {
  version: string;
  type: string;
  downloads: McpeDownloadLink[];
}

export interface McpeDownloadResponse {
  success: boolean;
  data: McpeDownloadInfo;
  message?: string;
}

export async function getVsList(): Promise<McpeVsListResponse> {
  const res = await fetch("/api/getmcpe/vslist");
  if (!res.ok) {
    throw new Error("API requested failed: " + res.status);
  }
  return res.json();
}

export async function getDownloadLinks(
  version: string,
  type?: "v8a" | "v7a",
): Promise<McpeDownloadResponse> {
  let url = `/api/getmcpe/download?version=${encodeURIComponent(version)}`;
  if (type) {
    url += `&type=${encodeURIComponent(type)}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("API requested failed: " + res.status);
  }
  return res.json();
}
