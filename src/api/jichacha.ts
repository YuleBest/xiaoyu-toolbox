import request from "./request";

const API_PREFIX = "/api/jichacha";

export interface BrandStats {
  brand: string;
  brand_title: string;
  count: number;
}

export interface MobileModel {
  id: number;
  brand: string;
  model: string;
  model_name: string;
  code: string;
  code_alias?: string;
  market_name?: string;
  // device_type?: string;
  // marketing_name?: string;
  [key: string]: any;
}

export interface SearchParams {
  q?: string;
  limit?: number;
  page?: number;
  model?: string;
  dtype?: string;
  brand?: string;
  code?: string;
  code_alias?: string;
  model_name?: string;
  ver_name?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  results: T[];
  dtypes?: { dtype: string; count: number }[];
}

/**
 * 获取品牌列表统计
 * 请求路径：/api/jichacha/detail
 */
export async function getBrandStats(
  page = 1,
  limit = 100,
): Promise<PaginatedResponse<BrandStats>> {
  const { data } = await request.get<PaginatedResponse<BrandStats>>(
    `${API_PREFIX}/detail`,
    {
      params: { page, limit },
    },
  );
  return data;
}

/**
 * 搜索机型
 * 请求路径：/api/jichacha/search
 */
export async function searchModels(
  params: SearchParams,
): Promise<PaginatedResponse<MobileModel>> {
  const { data } = await request.get<PaginatedResponse<MobileModel>>(
    `${API_PREFIX}/search`,
    {
      params,
    },
  );
  return data;
}

/**
 * 获取设备类型统计
 * 请求路径：/api/jichacha/dtypes
 */
export async function getDTypes(): Promise<{ dtype: string; count: number }[]> {
  const { data } = await request.get<{
    success: boolean;
    results: { dtype: string; count: number }[];
  }>(`${API_PREFIX}/dtypes`);
  return data.results;
}
