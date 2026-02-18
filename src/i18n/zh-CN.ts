export default {
  // === 通用 ===
  common: {
    appName: "小于工具箱",
    back: "返回",
    search: "搜索",
    searchTools: "搜索工具",
    copy: "复制",
    copySuccess: "复制成功",
    copyFailed: "复制失败",
    clear: "清空",
    clearAll: "清空内容",
    download: "下载",
    downloadSuccess: "下载成功",
    upload: "上传",
    export: "导出",
    import: "导入",
    delete: "删除",
    remove: "移除",
    cancel: "取消",
    confirm: "确认",
    close: "关闭",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    viewMore: "查看更多",
    chars: "字",
    approx: "约",
  },

  // === 导航 ===
  nav: {
    home: "首页",
    allTools: "全部工具",
    about: "关于本站",
    categoriesLabel: "类别",
    browseCategories: "浏览类别",
  },

  // === 分类 ===
  categories: {
    dev: "开发工具",
    image: "图像工具",
    media: "多媒体工具",
    life: "生活查询",
    game: "游戏工具",
  },

  // === 主题 ===
  theme: {
    label: "显示模式",
    toggle: "切换主题",
    light: "浅色模式",
    dark: "深色模式",
    system: "跟随系统",
  },

  // === 语言 ===
  lang: {
    label: "语言",
    zhCN: "简体中文",
    zhTW: "繁體中文",
    en: "English",
  },

  // === 首页 ===
  home: {
    featured: "精选推荐",
    hot: "热门使用",
    latest: "最新发布",
  },

  // === 搜索页 ===
  search: {
    placeholder: "搜索工具、分类或关键词...",
    startTitle: "输入关键词开始搜索",
    startDesc: "您可以搜索工具名称、功能描述或子标题，快速找到您需要的工具。",
    emptyTitle: "未找到相关工具",
    emptyDesc: "尝试更换关键词，或者关注后续更新。我们正在不断添加更多工具。",
  },

  // === 页脚 ===
  footer: {
    email: "邮箱",
    blog: "博客",
    copyright: "© 2026 YuleBest. All rights reserved.",
    disclaimer: "本站提供的所有工具仅供学习和研究使用。部分资源来源于网络。",
  },

  // === 工具容器 ===
  toolContainer: {
    details: "详情",
    toolInfo: "工具详情",
    description: "工具说明",
    usage: "使用指南",
    author: "作者:",
    publishDate: "发布日期:",
  },

  // === 工具列表 ===
  tools: {
    base64: {
      title: "Base64 转换",
      subtitle: "文本与 Base64 互转",
      description:
        "文本与 Base64 编码的相互转换，支持 UTF-8 中文与特殊字符，防止乱码。",
      usage:
        "1. 编码：在左侧输入原文，右侧自动显示 Base64 编码结果。\n2. 解码：在右侧输入 Base64 字符串，左侧自动显示解码后的原文。\n3. 点击复制按钮可快速复制内容。",
    },
    "json-yaml": {
      title: "JSON-YAML 转换",
      subtitle: "配置文件格式互转",
      description:
        "方便快捷的 JSON 与 YAML 格式互转工具，支持实时校验和格式化。",
      usage:
        "1. 粘贴 JSON 或 YAML 内容。\n2. 点击转换按钮即可进行格式转换。\n3. 支持一键复制和清空。",
    },
    playground: {
      title: "TypeScript 演练场",
      subtitle: "浏览器内的 JS / TS 沙盒",
      description:
        "基于 Sandpack 和 Monaco Editor 的在线代码演练场，支持实时预览 JavaScript/TypeScript 代码运行效果。",
      usage:
        "1. 编写代码：在左侧编辑器中编写 JS/TS 代码。\n2. 点击运行：日志栏将运行您的代码，并展示输出。\n3. 切换模板：支持 JS/TS 运行环境切换。",
    },
    qrcode: {
      title: "二维码工具",
      subtitle: "生成与识别二维码",
      description:
        "快速生成自定义二维码，或识别图片中的二维码内容。支持下载生成的二维码图片。",
      usage:
        '1. 生成：在"生成"标签页输入文本，即可实时预览二维码。\n2. 识别：在"识别"标签页上传或拖拽二维码图片，即可获取解析内容。',
    },
    exif: {
      title: "图片 EXIF 查看",
      subtitle: "查看图片元数据",
      description:
        "读取和显示图片的 EXIF 元数据，包括相机信息、拍摄参数、GPS 位置等。",
      usage:
        '1. 上传图片：点击"选择一张图片"按钮，选择本地图片文件。\n2. 查看信息：上传后自动解析 EXIF 数据，并在下方表格中显示。\n3. 预览：会显示图片预览，方便核对。',
    },
    dydown: {
      title: "抖音视频解析",
      subtitle: "无水印视频下载",
      description: "解析抖音分享链接，获取无水印视频直链和作者信息。",
      usage:
        '1. 在抖音APP中复制分享链接。\n2. 粘贴到输入框中，点击"解析"。\n3. 获取下载链接或直接下载视频。',
    },
    bilidown: {
      title: "B站视频解析",
      subtitle: "音视频流合并与下载",
      description:
        "解析 Bilibili 视频链接，获取音视频直链。内置 FFmpeg WASM 引擎，支持在浏览器中一键合并视频和音频。填写 Cookie 可开启 1080P+ 高清解析。",
      usage:
        '1. 复制 B 站视频链接（BV号）。\n2. 粘贴到输入框后点击"立即解析"。\n3. 若需高清画质，请在高级设置中填写完整 Cookie。\n4. 点击"一键合并"即可在浏览器内自动合并并下载 mp4 文件。',
    },
    lyric: {
      title: "歌词获取",
      subtitle: "搜索并下载歌词",
      description:
        "搜索歌曲并获取标准 LRC 格式歌词，支持下载和复制。基于酷狗音乐数据源，提供海量歌词资源。",
      usage:
        "1. 输入歌名或歌手名进行搜索。\n2. 从搜索结果中选择目标歌曲。\n3. 查看歌词内容，支持下载 LRC 文件或复制歌词文本。",
    },
    weather: {
      title: "天气查询",
      subtitle: "全国天气实时查询",
      description:
        "基于 Open-Meteo 的全球天气查询工具，支持查看实时天气、每小时预报及未来天气趋势。",
      usage:
        "1. 输入城市名称（支持中文拼音或英文）进行搜索。\n2. 选择正确的城市。\n3. 查看详细的天气信息。\n\nTip: 由于使用非本土化接口，搜索不到国内城市时，可尝试使用拼音。例如：beijing 代替北京",
    },
    hok: {
      title: "王者荣耀战斗查询",
      subtitle: "英雄装备技能查询",
      description:
        "王者荣耀游戏数据查询工具，支持查询英雄信息、装备属性和召唤师技能详情。包含完整的英雄皮肤列表、装备效果说明和技能冷却时间等详细信息。",
      usage:
        "1. 选择查询类别：英雄、装备或召唤师技能。\n2. 使用搜索框输入关键词快速查找。\n3. 英雄查询支持按职业筛选（战士、法师、坦克等）。\n4. 装备查询支持按类型筛选（攻击、法术、防御等）。\n5. 点击英雄卡片可查看详细信息和皮肤列表。",
    },
    reaction: {
      title: "反应力测试",
      subtitle: "毫秒级反应速度测试",
      description:
        "测试你的视觉反应速度。当屏幕颜色变绿时，尽可能快地点击屏幕或按下空格键。注意：本测试仅供娱乐，鼠标或键盘设备可能会引入额外的输入延迟。",
      usage:
        "1. 点击屏幕任意区域或按下空格键开始测试。\n2. 等待屏幕变红，保持专注。\n3. 屏幕变绿时立即点击或按空格！\n4. 查看你的毫秒级反应数据。",
    },
    jichacha: {
      title: "机查查",
      subtitle: "查找手机机型数据",
      description: "查询手机机型的详细参数、代号、市场名称等信息。",
      usage: "输入机型关键词（如 iPhone 14, SM-S9180）进行搜索",
      searchPlaceholder: "搜索机型 / 代码 / 别名...",
      brands: "热门品牌",
      totalModels: "共找到 {n} 个机型",
      noResults: "未找到相关机型",
      filterType: "筛选类型",
    },
  },

  // === Base64 页面 ===
  base64: {
    source: "原文",
    sourceLength: "原文长度",
    fileMode: "文件模式",
    fileLoaded: " 加载成功",
    encodeError: "编码错误",
    decodeError: "解码错误",
    copySource: "复制原文",
    copyBase64: "复制 Base64",
    downloadBase64: "下载 Base64",
    uploadFile: "文件转 Base64",
    uploading: "读取中...",
    fileSizeLimit: "文件大小不能超过 20MB",
    fileReadError: "文件读取失败",
    loadedAsBase64: "已加载为 Base64 原始数据",
    removeFile: "移除文件",
    contentHidden: "内容过长已隐藏",
    contentHiddenDesc:
      "字符数已超过 10,000，为防止页面卡顿，不再实时展示。请通过下载或复制按钮查看。",
    showAll: "展示全部内容 (共 {count} 字)",
    inputPlaceholder: "在此输入需要编码的内容...",
    base64Placeholder: "在此输入 Base64 字符串进行解码...",
    tip: "提示: 本工具支持双向转换。在左侧输入原文会自动进行 Base64 编码；在右侧输入 Base64 字符串会自动进行 解码。",
  },

  // === JSON-YAML 页面 ===
  jsonYaml: {
    importFile: "导入文件",
    formatJson: "格式化 JSON",
    jsonPlaceholder: "在此输入 JSON 内容...",
    yamlPlaceholder: "在此输入 YAML 内容...",
    exportJson: "导出 JSON",
    exportYaml: "导出 YAML",
    copyJson: "复制 JSON",
    copyYaml: "复制 YAML",
    fileSizeLimit: "文件大小不能超过 5MB",
    importSuccess: "导入成功",
    exporting: "文件导出中...",
    formatSuccess: "格式化成功",
    formatError: "JSON 格式错误，无法格式化",
    tip: "提示: 本工具支持双向实时转换、导入和文件导出。语法错误时下方会有详细提示。",
  },

  // === 二维码页面 ===
  qrcode: {
    generateTab: "生成二维码",
    scanTab: "扫描二维码",
    contentType: "内容类型",
    text: "文本",
    link: "链接",
    wifi: "WiFi",
    mail: "邮箱",
    inputContent: "输入内容",
    textPlaceholder: "请输入文本内容...",
    linkPlaceholder: "请输入网址 (例如: https://yule.ink)...",
    wifiSsid: "网络名称 (SSID)",
    wifiSsidPlaceholder: "WIFI 名称",
    securityType: "安全类型",
    noPassword: "无密码",
    password: "密码",
    wifiPasswordPlaceholder: "WiFi 密码",
    hiddenNetwork: "隐藏网络",
    recipient: "收件人",
    subjectOptional: "主题 (可选)",
    subjectPlaceholder: "邮件主题",
    bodyLabel: "内容",
    bodyPlaceholder: "邮件正文...",
    appearance: "外观设置",
    errorLevel: "容错级别",
    errorLevelDesc:
      "L: 7% 纠错, M: 15%, Q: 25%, H: 30%。更高级别允许部分遮挡。",
    qrColor: "二维码颜色",
    margin: "边距 (Margin)",
    size: "尺寸 (Size)",
    preview: "实时预览",
    waitInput: "等待输入...",
    saveQr: "保存二维码",
    transparentWarning: "透明区域在深色模式下可能无法识别，建议使用默认背景",
    wifiWarning:
      "💡 WiFi 二维码在多协议下可能由于设备差异出现识别失败，请确保 SSID 和密码准确无误。",
    generateFailed: "生成二维码失败",
    scanOrUpload: "识别或上传图片",
    dragOrClick: "支持拖拽图片到这里，或点击下方按钮选择",
    selectImage: "选择图片",
    imageSizeLimit: "图片大小不能超过 10MB",
    scanSuccess: "解析成功",
    noQrFound: "未发现二维码",
    scanResult: "识别结果",
    copyContent: "复制内容",
    visitLink: "访问链接",
  },

  // === EXIF 页面 ===
  exif: {
    selectOrDrag: "选择或拖拽图片",
    supportedFormats: "支持 JPG、PNG、HEIC 等格式，自动读取 EXIF",
    selectImage: "选择图片",
    parsing: "正在解析 EXIF 数据...",
    selectFirst: "请先选择一张图片",
    noExif: "该图片不包含 EXIF 信息",
    parseSuccess: "EXIF 解析成功",
    parseFailed: "EXIF 解析失败，该图片格式可能不受支持",
    fileSizeLimit: "文件大小不能超过 50MB",
    dragImageOnly: "请拖入图片文件",
    copyJson: "复制 JSON",
    copiedJson: "已复制为 JSON",
    exportJson: "正在导出 JSON",
    changeImage: "换一张",
    replaceImage: "更换图片",
    unknownDevice: "未知设备",
    exifDetails: "EXIF 详细参数",
    totalItems: "共 {count} 项数据",
    hideInvalid: "隐藏无效信息",
    field: "字段",
    value: "值",
    action: "操作",
    copied: "已复制 {label}",
    copyItem: "复制该项",
    fields: {
      ImageWidth: "图像宽度",
      ImageHeight: "图像高度",
      Make: "相机制造商",
      Model: "相机型号",
      Orientation: "图像方向",
      XResolution: "水平分辨率",
      YResolution: "垂直分辨率",
      ResolutionUnit: "分辨率单位",
      ModifyDate: "文件修改时间",
      YCbCrPositioning: "YCbCr 取样位置",
      ExposureTime: "曝光时间",
      FNumber: "光圈值",
      ExposureProgram: "曝光程序",
      ISO: "ISO 感光度",
      ExifVersion: "Exif 版本",
      DateTimeOriginal: "原始拍摄时间",
      CreateDate: "数字化时间",
      OffsetTimeOriginal: "原始时间偏移",
      ComponentsConfiguration: "色彩分量配置",
      ShutterSpeedValue: "快门速度值",
      ApertureValue: "光圈值（APEX）",
      BrightnessValue: "亮度值",
      ExposureCompensation: "曝光补偿",
      MaxApertureValue: "最大光圈值",
      MeteringMode: "测光模式",
      LightSource: "光源类型",
      Flash: "闪光灯状态",
      FocalLength: "焦距",
      SubSecTime: "亚秒时间",
      SubSecTimeOriginal: "原始拍摄亚秒时间",
      SubSecTimeDigitized: "数字化亚秒时间",
      FlashpixVersion: "FlashPix 版本",
      ColorSpace: "色彩空间",
      ExifImageWidth: "Exif 图像宽度",
      ExifImageHeight: "Exif 图像高度",
      SensingMethod: "感光方式",
      SceneType: "场景类型",
      ExposureMode: "曝光模式",
      WhiteBalance: "白平衡",
      DigitalZoomRatio: "数字变焦倍率",
      FocalLengthIn35mmFormat: "35mm 等效焦距",
      SceneCaptureType: "场景拍摄类型",
      LensModel: "镜头型号",
      GPSLatitude: "GPS 纬度",
      GPSLongitude: "GPS 经度",
      GPSAltitudeRef: "GPS 高度参考",
      GPSAltitude: "GPS 海拔高度",
      GPSTimeStamp: "GPS 时间戳",
      GPSProcessingMethod: "GPS 定位方式",
      latitude: "纬度（解析值）",
      longitude: "经度（解析值）",
      InteropIndex: "互操作索引",
      InteropVersion: "互操作版本",
      Software: "系统",
      ColorType: "色彩类型",
      BitDepth: "位深度",
      ImageDescription: "图像描述",
      Compression: "压缩方式",
      Filter: "滤镜",
      Interlace: "交错模式",
      ImageUniqueID: "图像唯一标识",
    },
  },

  // === 反应力测试 ===
  reaction: {
    waiting: {
      title: "反应力测试",
      subtitle: "当屏幕变绿时尽快点击",
      hint: "点击任意区域开始测试",
    },
    ready: {
      title: "等待绿色...",
      subtitle: "保持专注",
    },
    now: {
      title: "点击！！！",
    },
    result: {
      title: "你的成绩",
      subtitle: "点击再次尝试",
    },
    early: {
      title: "太快了！",
      subtitle: "请等待屏幕变绿后再点击",
      hint: "点击任意区域重新开始",
    },
    rank: {
      cheat: "你是挂吧？？？",
      king: "🏆 荣耀王者",
      star: "⭐ 至尊星耀",
      diamond: "💎 永恒钻石",
      gold: "🥇 荣耀黄金",
      bronze: "🥉 倔强青铜",
      afk: "💤 挂机了？",
    },
  },

  // === 抖音下载 ===
  dydown: {
    inputPlaceholder: "粘贴抖音分享链接...",
    parse: "解析",
    parsing: "解析中...",
    parseFailed: "解析失败",
    author: "作者",
    downloadVideo: "下载视频",
    downloadAudio: "下载音频",
    disclaimer: "免责声明",
    disclaimerText:
      "本工具仅供学习和研究使用，请勿用于商业用途。解析所得内容的版权归原作者所有。",
    firstUseTitle: "使用说明",
    firstUseDesc:
      "本工具通过 API 解析抖音分享链接来获取无水印视频直链。所有解析均在服务端完成，不会收集任何用户信息。",
    agree: "我已了解，开始使用",
    disclaimerItem1: "请勿将下载的视频用于商业用途",
    disclaimerItem2: "请尊重原创作者的知识产权",
    disclaimerItem3: "所有视频版权归原作者所有",
    disclaimerItem4: "使用本工具所产生的一切后果由使用者自行承担",
  },

  // === B站下载 ===
  bilidown: {
    inputPlaceholder: "输入 B 站视频链接或 BV 号...",
    parseNow: "立即解析",
    parsing: "解析中...",
    parseFailed: "解析失败",
    advancedSettings: "高级设置",
    cookiePlaceholder: "粘贴完整 Cookie 以启用高清解析...",
    cookieTip:
      "填写 Cookie 后可解锁 1080P 及以上画质。Cookie 仅用于本次请求，不会被存储。",
    videoStream: "视频流",
    audioStream: "音频流",
    mergeDownload: "一键合并",
    merging: "合并中...",
    mergeFailed: "合并失败",
    mergeSuccess: "合并完成",
    disclaimer: "免责声明",
    disclaimerText:
      "本工具仅供学习和研究使用。解析所得内容的版权归原作者所有。",
    firstUseTitle: "使用说明",
    firstUseDesc:
      "本工具解析 Bilibili 视频链接，获取音视频直链。内置 FFmpeg WASM 引擎，支持在浏览器中一键合并视频和音频。",
    agree: "我已了解，开始使用",
    disclaimerItem1: "请勿将下载的视频用于商业用途",
    disclaimerItem2: "请尊重原创作者的知识产权",
    disclaimerItem3: "所有视频版权归原作者和 Bilibili 所有",
    disclaimerItem4: "使用本工具所产生的一切后果由使用者自行承担",
    disclaimerItem5: "合并功能使用浏览器端 FFmpeg，不会上传任何数据",
    quality: "画质",
    codec: "编码",
    selectVideo: "选择视频流",
    selectAudio: "选择音频流",
  },

  // === 机查查 ===
  jichacha: {
    title: "机查查",
    subtitle: "查找手机机型数据",
    description: "查询手机机型的详细参数、代号、市场名称等信息。",
    usage: "输入机型关键词（如 iPhone 14, SM-S9180）进行搜索",
    searchPlaceholder: "搜索机型名称、代号...",
    brands: "热门品牌",
    model: "型号",
    code: "代号",
    marketName: "市场名称",
    totalModels: "收录机型",
    noResults: "未找到相关机型",
  },

  // === 歌词 ===
  lyric: {
    searchPlaceholder: "搜索歌名或歌手...",
    searching: "搜索中...",
    searchFailed: "搜索失败",
    noResults: "暂无搜索结果",
    loading: "加载中...",
    loadFailed: "歌词加载失败",
    noLyric: "暂无歌词",
    downloadLrc: "下载 LRC",
    copyLyric: "复制歌词",
    timeline: "时间轴",
    lyricMode: "纯文本",
    singer: "歌手",
    album: "专辑",
    duration: "时长",
  },

  // === 天气 ===
  weather: {
    searchPlaceholder: "输入城市名称...",
    searching: "搜索中...",
    searchFailed: "搜索失败",
    noResults: "未找到相关城市",
    currentWeather: "当前天气",
    hourlyForecast: "24小时预报",
    dailyForecast: "未来天气",
    temperature: "温度",
    humidity: "湿度",
    windSpeed: "风速",
    feelsLike: "体感温度",
    precipitation: "降水量",
    uvIndex: "紫外线指数",
    sunrise: "日出",
    sunset: "日落",
    searchTip:
      "Tip: 由于使用非本土化接口，搜索不到国内城市时，可尝试使用拼音。例如：beijing 代替北京",
  },

  // === 王者荣耀 ===
  hok: {
    hero: "英雄",
    item: "装备",
    skill: "技能",
    heroes: "英雄",
    items: "装备",
    summoner: "召唤师技能",
    all: "全部",
    searchHero: "搜索英雄名称...",
    searchItem: "搜索装备名称...",
    searchSkill: "搜索技能名称...",
    searchSummoner: "搜索技能...",
    allRoles: "全部",
    warrior: "战士",
    mage: "法师",
    tank: "坦克",
    assassin: "刺客",
    marksman: "射手",
    support: "辅助",
    attack: "攻击",
    magic: "法术",
    defense: "防御",
    movement: "移动",
    jungle: "打野",
    roam: "游走",
    heroDetail: "英雄详情",
    skins: "皮肤",
    skills: "技能",
    cooldown: "冷却：",
    manaCost: "耗蓝",
    gold: "金币",
    unknown: "未知",
    loadFailed: "数据加载失败",
    resultCount: "共 {count} 个结果",
  },

  // === Playground ===
  playground: {
    run: "运行",
    clear: "清空",
    console: "控制台",
    template: "模板",
    javascript: "JavaScript",
    typescript: "TypeScript",
  },
};
