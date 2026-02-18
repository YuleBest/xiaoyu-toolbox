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
  model?: string;
  dtype?: string;
  brand?: string;
  code?: string;
  code_alias?: string;
  model_name?: string;
  ver_name?: string;
}

interface SearchResponse {
  success: boolean;
  total: number;
  results: MobileModel[];
}

interface DetailResponse {
  success: boolean;
  results: BrandStats[];
}

/**
 * 获取品牌列表统计
 * 请求路径：/api/jichacha/detail
 */
export async function getBrandStats(): Promise<BrandStats[]> {
  const { data } = await request.get<DetailResponse>(`${API_PREFIX}/detail`);
  return data.results;
}

/**
 * 搜索机型
 * 请求路径：/api/jichacha/search
 */
export async function searchModels(
  params: SearchParams,
): Promise<MobileModel[]> {
  const { data } = await request.get<SearchResponse>(`${API_PREFIX}/search`, {
    params,
  });
  return data.results;
}
