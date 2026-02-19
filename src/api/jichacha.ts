import Fuse from "fuse.js";
import { BRAND_MAP } from "./brand_map";

const DATA_URL = "https://file.yule.ink/models.json";
const CACHE_NAME = "jichacha-cache-v1";
const CACHE_KEY_TIMESTAMP = "jichacha_cache_timestamp";
const CACHE_TTL = 3600 * 1000; // 1 hour

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
  dtype?: string;
  ver_name?: string;
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
  verNames?: { ver_name: string; count: number }[];
  fallbackType?: string;
  usedQuery?: string;
}

// Global State for Client-Side Cache
let allModels: MobileModel[] | null = null;
let lastModifiedTime: string | null = null;
let loadingPromise: Promise<void> | null = null;

/**
 * Clear Cache
 */
export async function clearCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(DATA_URL);
    localStorage.removeItem(CACHE_KEY_TIMESTAMP);
    allModels = null;
    lastModifiedTime = null;
    console.log("Jichacha cache cleared.");
  } catch (e) {
    console.error("Failed to clear cache:", e);
  }
}

/**
 * Singleton Data Loader
 */
async function loadData(forceRefresh = false) {
  if (allModels && !forceRefresh) return;
  if (loadingPromise && !forceRefresh) return loadingPromise;

  loadingPromise = (async () => {
    try {
      if (forceRefresh) {
        // Drop memory cache immediately
        allModels = null;
      }

      let data: MobileModel[] | null = null;
      let headers: Headers | null = null;

      // 1. Try Cache
      if (!forceRefresh) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(DATA_URL);
          const timestampStr = localStorage.getItem(CACHE_KEY_TIMESTAMP);

          if (cachedResponse && timestampStr) {
            const timestamp = parseInt(timestampStr, 10);
            const now = Date.now();

            if (now - timestamp < CACHE_TTL) {
              console.log("Loading models.json from Cache...");
              data = await cachedResponse.json();
              headers = cachedResponse.headers;
            } else {
              console.log("Cache expired.");
            }
          }
        } catch (e) {
          console.warn("Cache check failed:", e);
        }
      }

      // 2. Fetch Network
      if (!data) {
        console.log("Fetching models.json from CDN...");
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load models data");

        // Clone for cache
        const clone = response.clone();

        // Save to Cache
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(DATA_URL, clone);
          localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
        } catch (e) {
          console.warn("Cache write failed:", e);
        }

        data = await response.json();
        headers = response.headers;
      }

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format");
      }

      allModels = data;
      // Get Last-Modified from headers if possible
      if (headers) {
        lastModifiedTime = headers.get("Last-Modified");
      }

      console.log(`Loaded ${allModels.length} models.`);
    } catch (e) {
      console.error("Failed to load data:", e);
      allModels = [];
      throw e;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Force refresh data from network
 */
export async function refreshData() {
  return loadData(true);
}

// Hybrid Search Helper
function performSearch(
  q: string,
  filtered: MobileModel[],
): { results: MobileModel[]; usedQuery: string; fallbackType: string } {
  if (!q) return { results: filtered, usedQuery: "", fallbackType: "" };

  // Fuse Setup
  const keys = [
    { name: "model_name", weight: 10 },
    { name: "market_name", weight: 5 },
    { name: "model", weight: 5 },
    { name: "code", weight: 2 },
    { name: "code_alias", weight: 2 },
    { name: "brand_title", weight: 1 },
  ];

  const fuseStandard = new Fuse(filtered, {
    keys,
    threshold: 0.2, // Stricter
    ignoreLocation: true,
    useExtendedSearch: false,
  });

  const fuseExtended = new Fuse(filtered, {
    keys,
    threshold: 0.3, // Looser
    ignoreLocation: true,
    useExtendedSearch: true,
  });

  // 1. Standard Search
  let searchResult = fuseStandard.search(q);
  let itemsStandard = searchResult.map((r) => r.item);

  // 2. Extended Search
  const tokens = q.split(/\s+/).filter((t) => t.length > 0);
  let itemsExtended: MobileModel[] = [];
  if (tokens.length > 0) {
    const extendedQuery = tokens.join(" ");
    const resExtended = fuseExtended.search(extendedQuery);
    itemsExtended = resExtended.map((r) => r.item);
  }

  // Merge
  const seen = new Set<any>();
  let finalResults: MobileModel[] = [];

  for (const item of itemsStandard) {
    if (!seen.has(item)) {
      seen.add(item);
      finalResults.push(item);
    }
  }

  for (const item of itemsExtended) {
    if (!seen.has(item)) {
      seen.add(item);
      finalResults.push(item);
    }
  }

  let usedQuery = q;
  let fallbackType = "";

  // Fallbacks
  if (finalResults.length === 0) {
    // Strategy 1: Brand translation
    let modifiedQ = q;
    let hasBrandReplacement = false;
    for (const [cn, en] of Object.entries(BRAND_MAP)) {
      if (modifiedQ.includes(cn)) {
        modifiedQ = modifiedQ.replace(cn, en);
        hasBrandReplacement = true;
      }
    }

    if (hasBrandReplacement && modifiedQ !== q) {
      const res = fuseStandard.search(modifiedQ);
      if (res.length > 0) {
        finalResults = res.map((r) => r.item);
        usedQuery = modifiedQ;
        fallbackType = "translated_brand";
      }
    }
  }

  if (finalResults.length === 0) {
    // Strategy 2: Brand Fallback
    const keywords = q.split(/\s+/);
    let brandKw = "";
    for (const kw of keywords) {
      if (Object.values(BRAND_MAP).includes(kw.toLowerCase())) {
        brandKw = kw;
        break;
      }
      const cnBrand = Object.keys(BRAND_MAP).find((k) => k === kw);
      if (cnBrand) {
        brandKw = BRAND_MAP[cnBrand] || "";
        break;
      }
    }

    if (brandKw) {
      // Filter by brand directly
      const brandFiltered = filtered.filter(
        (m) => m.brand === brandKw || m.brand_title === brandKw,
      );
      if (brandFiltered.length > 0) {
        finalResults = brandFiltered;
        fallbackType = "brand_fallback";
        usedQuery = brandKw;
      }
    }
  }

  return { results: finalResults, usedQuery, fallbackType };
}

/**
 * 获取品牌列表统计
 */
export async function getBrandStats(
  page = 1,
  limit = 100,
): Promise<PaginatedResponse<BrandStats>> {
  await loadData();
  const models = allModels || [];

  const brandMap = new Map<
    string,
    { brand: string; brand_title: string; count: number }
  >();

  for (const model of models) {
    const brand = model.brand;
    if (!brand) continue;

    if (!brandMap.has(brand)) {
      brandMap.set(brand, {
        brand: brand,
        brand_title: model.brand_title || brand,
        count: 0,
      });
    }
    brandMap.get(brand)!.count++;
  }

  const allBrands = Array.from(brandMap.values()).sort(
    (a, b) => b.count - a.count,
  );
  const total = allBrands.length;
  const offset = (page - 1) * limit;
  const results = allBrands.slice(offset, offset + limit);

  return {
    success: true,
    page,
    limit,
    total,
    results,
  };
}

/**
 * 搜索机型
 */
export async function searchModels(
  params: SearchParams,
): Promise<PaginatedResponse<MobileModel>> {
  await loadData();
  const models = allModels || [];

  const q = (params.q || "").trim();
  const page = params.page || 1;
  const limit = params.limit || 100;
  const offset = (page - 1) * limit;

  // Filter first
  const filtered = models.filter((m) => {
    if (params.dtype && m.dtype !== params.dtype) return false;
    if (params.brand && m.brand !== params.brand) return false;
    if (params.ver_name && m.ver_name !== params.ver_name) return false;
    return true;
  });

  // Search
  let {
    results: finalResults,
    usedQuery,
    fallbackType,
  } = performSearch(q, filtered);

  if (!q && !params.brand && !params.dtype && !params.ver_name) {
    if (!q) finalResults = filtered;
  } else if (!q) {
    finalResults = filtered;
  }

  // Facets
  // Dtypes Facet
  const dtypeCounts = new Map<string, number>();
  finalResults.forEach((m) => {
    if (m.dtype) {
      dtypeCounts.set(m.dtype, (dtypeCounts.get(m.dtype) || 0) + 1);
    }
  });
  const dtypes = Array.from(dtypeCounts.entries())
    .map(([dtype, count]) => ({ dtype, count }))
    .sort((a, b) => b.count - a.count);

  // VerNames Facet
  const verNameCounts = new Map<string, number>();
  finalResults.forEach((m) => {
    if (m.ver_name) {
      verNameCounts.set(m.ver_name, (verNameCounts.get(m.ver_name) || 0) + 1);
    }
  });
  const verNames = Array.from(verNameCounts.entries())
    .map(([ver_name, count]) => ({ ver_name, count }))
    .sort((a, b) => b.count - a.count);

  const total = finalResults.length;
  const results = finalResults.slice(offset, offset + limit);

  return {
    success: true,
    page,
    limit,
    total,
    results,
    dtypes,
    verNames,
    fallbackType,
    usedQuery: usedQuery !== q ? usedQuery : undefined,
  };
}

/**
 * 获取设备类型统计
 */
export async function getDTypes(): Promise<{ dtype: string; count: number }[]> {
  await loadData();
  const models = allModels || [];

  const dtypeCounts = new Map<string, number>();

  for (const model of models) {
    if (!model.dtype) continue;
    dtypeCounts.set(model.dtype, (dtypeCounts.get(model.dtype) || 0) + 1);
  }

  return Array.from(dtypeCounts.entries())
    .map(([dtype, count]) => ({ dtype, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取数据库更新时间
 */
export async function getUpdateTime(): Promise<string> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/YuleBest/MobileModels-JSON/refs/heads/master/update_time.txt?t=${Date.now()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch update time");
    return await response.text();
  } catch (e) {
    console.error("Failed to fetch update time:", e);
    // Fallback: try to get from headers if available
    await loadData();
    if (lastModifiedTime) {
      const date = new Date(lastModifiedTime);
      return date.toISOString().replace("T", " ").substring(0, 19);
    }
    return new Date().toISOString();
  }
}
