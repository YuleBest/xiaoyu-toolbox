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
