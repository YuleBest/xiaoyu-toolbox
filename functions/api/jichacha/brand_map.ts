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
  360: "360",
  华硕: "asus",
  HTC: "htc",
  谷歌: "google",
  诺基亚: "nokia",
  微软: "microsoft",
  LG: "lg",
};

export const getBrandCode = (input: string): string | null => {
  const normalized = input.toLowerCase().trim();
  return BRAND_MAP[normalized] || null;
};

/**
 * Get related keywords for a given input (bi-directional lookups).
 * e.g. "红米" -> ["红米", "redmi"]
 * e.g. "redmi" -> ["redmi", "红米"]
 */
export const getRelatedKeywords = (input: string): string[] => {
  const specializedMap: Record<string, string> = {
    // Specialized mappings (lower case keys)
    redmi: "红米",
    realme: "真我",
    sony: "索尼",
    apple: "苹果",
  };

  const normalized = input.toLowerCase().trim();
  const results = new Set<string>();
  results.add(input); // Always include self

  // 1. Check if input is a key in BRAND_MAP (ZH -> EN)
  if (BRAND_MAP[normalized]) {
    results.add(BRAND_MAP[normalized]);
  }

  // 2. Check if input is a value in BRAND_MAP (EN -> ZH)
  // This is O(N) but N is small.
  for (const [cn, en] of Object.entries(BRAND_MAP)) {
    if (en === normalized) {
      results.add(cn);
    }
  }

  // 3. Check specialized map (explicit requests from user)
  if (specializedMap[normalized]) {
    results.add(specializedMap[normalized]);
  }

  return Array.from(results);
};

/**
 * Simple keyword segmentation.
 * Splits between:
 * - Chinese & English/Number
 * - English & Number
 */
export const segmentSearchQuery = (input: string): string[] => {
  let processed = input;
  // Chinese vs English/Number
  processed = processed.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, "$1 $2");
  processed = processed.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, "$1 $2");
  // English vs Number
  processed = processed.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  processed = processed.replace(/([0-9])([a-zA-Z])/g, "$1 $2");

  return processed.split(/\s+/).filter((k) => k.length > 0);
};
