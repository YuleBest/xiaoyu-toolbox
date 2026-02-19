export const BRAND_MAP: Record<string, string> = {
  小米: "xiaomi",
  红米: "redmi",
  华为: "huawei",
  荣耀: "honor",
  oppo: "oppo",
  vivo: "vivo",
  三星: "samsung",
  苹果: "apple",
  魅族: "meizu",
  一加: "oneplus",
  真我: "realme",
  努比亚: "nubia",
  中兴: "zte",
  索尼: "sony",
  摩托罗拉: "motorola",
  联想: "lenovo",
  黑鲨: "blackshark",
  红魔: "redmagic",
  拯救者: "legion",
  酷派: "coolpad",
  乐视: "leeco",
  金立: "gionee",
  锤子: "smartisan",
  坚果: "smartisan",
  "360": "360",
  华硕: "asus",
  HTC: "htc",
  谷歌: "google",
  诺基亚: "nokia",
  微软: "microsoft",
  LG: "lg",
};

/**
 * 获取品牌代码
 */
export const getBrandCode = (input: string): string | null => {
  const normalized = input.toLowerCase().trim();
  return BRAND_MAP[normalized] || null;
};

/**
 * 获取相关关键词（优化版）
 * 在 FTS5 模式下，我们主要用于 Fallback 逻辑
 */
export const getRelatedKeywords = (input: string): string[] => {
  const normalized = input.toLowerCase().trim();
  const results = new Set<string>();
  results.add(input);

  // ZH -> EN
  if (BRAND_MAP[normalized]) {
    results.add(BRAND_MAP[normalized]);
  }

  // EN -> ZH (保持 O(N)，因为品牌列表很短)
  for (const [cn, en] of Object.entries(BRAND_MAP)) {
    if (en === normalized) {
      results.add(cn);
    }
  }

  return Array.from(results);
};

/**
 * 智能分词（优化版）
 * 增加对非法字符的过滤，确保生成的词可以直接喂给 FTS5
 */
export const segmentSearchQuery = (input: string): string[] => {
  // 1. 过滤掉 SQL FTS5 的特殊控制字符，防止查询报错
  let processed = input.replace(/[*\-"':()]/g, " ");

  // 2. 插入空格：中英、中数、英数之间增加空格
  processed = processed.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, "$1 $2");
  processed = processed.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, "$1 $2");
  processed = processed.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  processed = processed.replace(/([0-9])([a-zA-Z])/g, "$1 $2");

  // 3. 按照空格切分，过滤掉空字符和超短字符（可选）
  return processed.split(/\s+/).filter((k) => k.length > 0);
};
