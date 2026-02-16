export default {
  // === 通用 ===
  common: {
    appName: "小於工具箱",
    back: "返回",
    search: "搜尋",
    searchTools: "搜尋工具",
    copy: "複製",
    copySuccess: "複製成功",
    copyFailed: "複製失敗",
    clear: "清空",
    clearAll: "清空內容",
    download: "下載",
    downloadSuccess: "下載成功",
    upload: "上傳",
    export: "匯出",
    import: "匯入",
    delete: "刪除",
    remove: "移除",
    cancel: "取消",
    confirm: "確認",
    close: "關閉",
    loading: "載入中...",
    error: "錯誤",
    success: "成功",
    viewMore: "查看更多",
    chars: "字",
    approx: "約",
  },

  // === 導航 ===
  nav: {
    home: "首頁",
    allTools: "全部工具",
    about: "關於本站",
    categoriesLabel: "類別",
    browseCategories: "瀏覽類別",
  },

  // === 分類 ===
  categories: {
    dev: "開發工具",
    image: "圖像工具",
    media: "多媒體工具",
    life: "生活查詢",
    game: "遊戲工具",
  },

  // === 主題 ===
  theme: {
    label: "顯示模式",
    toggle: "切換主題",
    light: "淺色模式",
    dark: "深色模式",
    system: "跟隨系統",
  },

  // === 語言 ===
  lang: {
    label: "語言",
    zhCN: "简体中文",
    zhTW: "繁體中文",
    en: "English",
  },

  // === 首頁 ===
  home: {
    featured: "精選推薦",
    hot: "熱門使用",
    latest: "最新發佈",
  },

  // === 搜尋頁 ===
  search: {
    placeholder: "搜尋工具、分類或關鍵詞...",
    startTitle: "輸入關鍵詞開始搜尋",
    startDesc: "您可以搜尋工具名稱、功能描述或子標題，快速找到您需要的工具。",
    emptyTitle: "未找到相關工具",
    emptyDesc: "嘗試更換關鍵詞，或者關注後續更新。我們正在不斷添加更多工具。",
  },

  // === 頁尾 ===
  footer: {
    email: "郵箱",
    blog: "部落格",
    copyright: "© 2026 YuleBest. All rights reserved.",
    disclaimer: "本站提供的所有工具僅供學習和研究使用。部分資源來源於網路。",
  },

  // === 工具容器 ===
  toolContainer: {
    details: "詳情",
    toolInfo: "工具詳情",
    description: "工具說明",
    usage: "使用指南",
    author: "作者:",
    publishDate: "發佈日期:",
  },

  // === 工具列表 ===
  tools: {
    base64: {
      title: "Base64 轉換",
      subtitle: "文字與 Base64 互轉",
      description:
        "文字與 Base64 編碼的相互轉換，支援 UTF-8 中文與特殊字元，防止亂碼。",
      usage:
        "1. 編碼：在左側輸入原文，右側自動顯示 Base64 編碼結果。\n2. 解碼：在右側輸入 Base64 字串，左側自動顯示解碼後的原文。\n3. 點擊複製按鈕可快速複製內容。",
    },
    "json-yaml": {
      title: "JSON-YAML 轉換",
      subtitle: "設定檔格式互轉",
      description:
        "方便快捷的 JSON 與 YAML 格式互轉工具，支援即時校驗和格式化。",
      usage:
        "1. 貼上 JSON 或 YAML 內容。\n2. 點擊轉換按鈕即可進行格式轉換。\n3. 支援一鍵複製和清空。",
    },
    playground: {
      title: "TypeScript 演練場",
      subtitle: "瀏覽器內的 JS / TS 沙盒",
      description:
        "基於 Sandpack 和 Monaco Editor 的線上程式碼演練場，支援即時預覽 JavaScript/TypeScript 程式碼運行效果。",
      usage:
        "1. 編寫程式碼：在左側編輯器中編寫 JS/TS 程式碼。\n2. 點擊運行：日誌欄將運行您的程式碼，並展示輸出。\n3. 切換模板：支援 JS/TS 運行環境切換。",
    },
    qrcode: {
      title: "QR Code 工具",
      subtitle: "產生與辨識 QR Code",
      description:
        "快速產生自訂 QR Code，或辨識圖片中的 QR Code 內容。支援下載產生的 QR Code 圖片。",
      usage:
        "1. 產生：在「產生」標籤頁輸入文字，即可即時預覽 QR Code。\n2. 辨識：在「辨識」標籤頁上傳或拖曳 QR Code 圖片，即可取得解析內容。",
    },
    exif: {
      title: "圖片 EXIF 檢視",
      subtitle: "檢視圖片中繼資料",
      description:
        "讀取和顯示圖片的 EXIF 中繼資料，包括相機資訊、拍攝參數、GPS 位置等。",
      usage:
        "1. 上傳圖片：點擊「選擇一張圖片」按鈕，選擇本機圖片檔案。\n2. 檢視資訊：上傳後自動解析 EXIF 資料，並在下方表格中顯示。\n3. 預覽：會顯示圖片預覽，方便核對。",
    },
    dydown: {
      title: "抖音影片解析",
      subtitle: "無浮水印影片下載",
      description: "解析抖音分享連結，取得無浮水印影片直鏈和作者資訊。",
      usage:
        "1. 在抖音 APP 中複製分享連結。\n2. 貼上到輸入框中，點擊「解析」。\n3. 取得下載連結或直接下載影片。",
    },
    bilidown: {
      title: "B站影片解析",
      subtitle: "音視訊流合併與下載",
      description:
        "解析 Bilibili 影片連結，取得音視訊直鏈。內建 FFmpeg WASM 引擎，支援在瀏覽器中一鍵合併影片和音訊。填寫 Cookie 可開啟 1080P+ 高畫質解析。",
      usage:
        "1. 複製 B 站影片連結（BV號）。\n2. 貼上到輸入框後點擊「立即解析」。\n3. 若需高畫質，請在進階設定中填寫完整 Cookie。\n4. 點擊「一鍵合併」即可在瀏覽器內自動合併並下載 mp4 檔案。",
    },
    lyric: {
      title: "歌詞取得",
      subtitle: "搜尋並下載歌詞",
      description:
        "搜尋歌曲並取得標準 LRC 格式歌詞，支援下載和複製。基於酷狗音樂資料來源，提供海量歌詞資源。",
      usage:
        "1. 輸入歌名或歌手名進行搜尋。\n2. 從搜尋結果中選擇目標歌曲。\n3. 檢視歌詞內容，支援下載 LRC 檔案或複製歌詞文字。",
    },
    weather: {
      title: "天氣查詢",
      subtitle: "全球天氣即時查詢",
      description:
        "基於 Open-Meteo 的全球天氣查詢工具，支援檢視即時天氣、每小時預報及未來天氣趨勢。",
      usage:
        "1. 輸入城市名稱（支援拼音或英文）進行搜尋。\n2. 選擇正確的城市。\n3. 檢視詳細的天氣資訊。\n\nTip: 由於使用非本土化介面，搜尋不到國內城市時，可嘗試使用拼音。例如：beijing 代替北京",
    },
    hok: {
      title: "王者榮耀戰鬥查詢",
      subtitle: "英雄裝備技能查詢",
      description:
        "王者榮耀遊戲資料查詢工具，支援查詢英雄資訊、裝備屬性和召喚師技能詳情。包含完整的英雄造型列表、裝備效果說明和技能冷卻時間等詳細資訊。",
      usage:
        "1. 選擇查詢類別：英雄、裝備或召喚師技能。\n2. 使用搜尋框輸入關鍵詞快速查找。\n3. 英雄查詢支援按職業篩選（戰士、法師、坦克等）。\n4. 裝備查詢支援按類型篩選（攻擊、法術、防禦等）。\n5. 點擊英雄卡片可檢視詳細資訊和造型列表。",
    },
    reaction: {
      title: "反應力測試",
      subtitle: "毫秒級反應速度測試",
      description:
        "測試你的視覺反應速度。當螢幕顏色變綠時，盡可能快地點擊螢幕或按下空白鍵。注意：本測試僅供娛樂，滑鼠或鍵盤裝置可能會引入額外的輸入延遲。",
      usage:
        "1. 點擊螢幕任意區域或按下空白鍵開始測試。\n2. 等待螢幕變紅，保持專注。\n3. 螢幕變綠時立即點擊或按空白鍵！\n4. 檢視你的毫秒級反應資料。",
    },
  },

  // === Base64 頁面 ===
  base64: {
    source: "原文",
    sourceLength: "原文長度",
    fileMode: "檔案模式",
    fileLoaded: " 載入成功",
    encodeError: "編碼錯誤",
    decodeError: "解碼錯誤",
    copySource: "複製原文",
    copyBase64: "複製 Base64",
    downloadBase64: "下載 Base64",
    uploadFile: "檔案轉 Base64",
    uploading: "讀取中...",
    fileSizeLimit: "檔案大小不能超過 20MB",
    fileReadError: "檔案讀取失敗",
    loadedAsBase64: "已載入為 Base64 原始資料",
    removeFile: "移除檔案",
    contentHidden: "內容過長已隱藏",
    contentHiddenDesc:
      "字元數已超過 10,000，為防止頁面卡頓，不再即時展示。請透過下載或複製按鈕檢視。",
    showAll: "展示全部內容 (共 {count} 字)",
    inputPlaceholder: "在此輸入需要編碼的內容...",
    base64Placeholder: "在此輸入 Base64 字串進行解碼...",
    tip: "提示: 本工具支援雙向轉換。在左側輸入原文會自動進行 Base64 編碼；在右側輸入 Base64 字串會自動進行解碼。",
  },

  // === JSON-YAML 頁面 ===
  jsonYaml: {
    importFile: "匯入檔案",
    formatJson: "格式化 JSON",
    jsonPlaceholder: "在此輸入 JSON 內容...",
    yamlPlaceholder: "在此輸入 YAML 內容...",
    exportJson: "匯出 JSON",
    exportYaml: "匯出 YAML",
    copyJson: "複製 JSON",
    copyYaml: "複製 YAML",
    fileSizeLimit: "檔案大小不能超過 5MB",
    importSuccess: "匯入成功",
    exporting: "檔案匯出中...",
    formatSuccess: "格式化成功",
    formatError: "JSON 格式錯誤，無法格式化",
    tip: "提示: 本工具支援雙向即時轉換、匯入和檔案匯出。語法錯誤時下方會有詳細提示。",
  },

  // === QR Code 頁面 ===
  qrcode: {
    generateTab: "產生 QR Code",
    scanTab: "掃描 QR Code",
    contentType: "內容類型",
    text: "文字",
    link: "連結",
    wifi: "WiFi",
    mail: "郵箱",
    inputContent: "輸入內容",
    textPlaceholder: "請輸入文字內容...",
    linkPlaceholder: "請輸入網址 (例如: https://yule.ink)...",
    wifiSsid: "網路名稱 (SSID)",
    wifiSsidPlaceholder: "WiFi 名稱",
    securityType: "安全類型",
    noPassword: "無密碼",
    password: "密碼",
    wifiPasswordPlaceholder: "WiFi 密碼",
    hiddenNetwork: "隱藏網路",
    recipient: "收件人",
    subjectOptional: "主旨 (選填)",
    subjectPlaceholder: "郵件主旨",
    bodyLabel: "內容",
    bodyPlaceholder: "郵件正文...",
    appearance: "外觀設定",
    errorLevel: "容錯等級",
    errorLevelDesc:
      "L: 7% 糾錯, M: 15%, Q: 25%, H: 30%。更高等級允許部分遮擋。",
    qrColor: "QR Code 顏色",
    margin: "邊距 (Margin)",
    size: "尺寸 (Size)",
    preview: "即時預覽",
    waitInput: "等待輸入...",
    saveQr: "儲存 QR Code",
    transparentWarning: "透明區域在深色模式下可能無法辨識，建議使用預設背景",
    wifiWarning:
      "💡 WiFi QR Code 在多協定下可能由於裝置差異出現辨識失敗，請確保 SSID 和密碼準確無誤。",
    generateFailed: "產生 QR Code 失敗",
    scanOrUpload: "辨識或上傳圖片",
    dragOrClick: "支援拖曳圖片到這裡，或點擊下方按鈕選擇",
    selectImage: "選擇圖片",
    imageSizeLimit: "圖片大小不能超過 10MB",
    scanSuccess: "解析成功",
    noQrFound: "未發現 QR Code",
    scanResult: "辨識結果",
    copyContent: "複製內容",
    visitLink: "造訪連結",
  },

  // === EXIF 頁面 ===
  exif: {
    selectOrDrag: "選擇或拖曳圖片",
    supportedFormats: "支援 JPG、PNG、HEIC 等格式，自動讀取 EXIF",
    selectImage: "選擇圖片",
    parsing: "正在解析 EXIF 資料...",
    selectFirst: "請先選擇一張圖片",
    noExif: "該圖片不包含 EXIF 資訊",
    parseSuccess: "EXIF 解析成功",
    parseFailed: "EXIF 解析失敗，該圖片格式可能不受支援",
    fileSizeLimit: "檔案大小不能超過 50MB",
    dragImageOnly: "請拖入圖片檔案",
    copyJson: "複製 JSON",
    copiedJson: "已複製為 JSON",
    exportJson: "正在匯出 JSON",
    changeImage: "換一張",
    replaceImage: "更換圖片",
    unknownDevice: "未知裝置",
    exifDetails: "EXIF 詳細參數",
    totalItems: "共 {count} 項資料",
    hideInvalid: "隱藏無效資訊",
    field: "欄位",
    value: "值",
    action: "操作",
    copied: "已複製 {label}",
    copyItem: "複製該項",
    fields: {
      ImageWidth: "影像寬度",
      ImageHeight: "影像高度",
      Make: "相機製造商",
      Model: "相機型號",
      Orientation: "影像方向",
      XResolution: "水平解析度",
      YResolution: "垂直解析度",
      ResolutionUnit: "解析度單位",
      ModifyDate: "檔案修改時間",
      YCbCrPositioning: "YCbCr 取樣位置",
      ExposureTime: "曝光時間",
      FNumber: "光圈值",
      ExposureProgram: "曝光程式",
      ISO: "ISO 感光度",
      ExifVersion: "Exif 版本",
      DateTimeOriginal: "原始拍攝時間",
      CreateDate: "數位化時間",
      OffsetTimeOriginal: "原始時間偏移",
      ComponentsConfiguration: "色彩分量配置",
      ShutterSpeedValue: "快門速度值",
      ApertureValue: "光圈值（APEX）",
      BrightnessValue: "亮度值",
      ExposureCompensation: "曝光補償",
      MaxApertureValue: "最大光圈值",
      MeteringMode: "測光模式",
      LightSource: "光源類型",
      Flash: "閃光燈狀態",
      FocalLength: "焦距",
      SubSecTime: "亞秒時間",
      SubSecTimeOriginal: "原始拍攝亞秒時間",
      SubSecTimeDigitized: "數位化亞秒時間",
      FlashpixVersion: "FlashPix 版本",
      ColorSpace: "色彩空間",
      ExifImageWidth: "Exif 影像寬度",
      ExifImageHeight: "Exif 影像高度",
      SensingMethod: "感光方式",
      SceneType: "場景類型",
      ExposureMode: "曝光模式",
      WhiteBalance: "白平衡",
      DigitalZoomRatio: "數位變焦倍率",
      FocalLengthIn35mmFormat: "35mm 等效焦距",
      SceneCaptureType: "場景拍攝類型",
      LensModel: "鏡頭型號",
      GPSLatitude: "GPS 緯度",
      GPSLongitude: "GPS 經度",
      GPSAltitudeRef: "GPS 高度參考",
      GPSAltitude: "GPS 海拔高度",
      GPSTimeStamp: "GPS 時間戳",
      GPSProcessingMethod: "GPS 定位方式",
      latitude: "緯度（解析值）",
      longitude: "經度（解析值）",
      InteropIndex: "互操作索引",
      InteropVersion: "互操作版本",
      Software: "軟體",
      ColorType: "色彩類型",
      BitDepth: "位元深度",
      ImageDescription: "影像描述",
      Compression: "壓縮方式",
      Filter: "濾鏡",
      Interlace: "交錯模式",
      ImageUniqueID: "影像唯一標識",
    },
  },

  // === 反應力測試 ===
  reaction: {
    waiting: {
      title: "反應力測試",
      subtitle: "當螢幕變綠時盡快點擊",
      hint: "點擊任意區域開始測試",
    },
    ready: {
      title: "等待綠色...",
      subtitle: "保持專注",
    },
    now: {
      title: "點擊！！！",
    },
    result: {
      title: "你的成績",
      subtitle: "點擊再次嘗試",
    },
    early: {
      title: "太快了！",
      subtitle: "請等待螢幕變綠後再點擊",
      hint: "點擊任意區域重新開始",
    },
    rank: {
      cheat: "你是掛吧？？？",
      king: "🏆 榮耀王者",
      star: "⭐ 至尊星耀",
      diamond: "💎 永恆鑽石",
      gold: "🥇 榮耀黃金",
      bronze: "🥉 倔強青銅",
      afk: "💤 掛機了？",
    },
  },

  // === 抖音下載 ===
  dydown: {
    inputPlaceholder: "貼上抖音分享連結...",
    parse: "解析",
    parsing: "解析中...",
    parseFailed: "解析失敗",
    author: "作者",
    downloadVideo: "下載影片",
    downloadAudio: "下載音訊",
    disclaimer: "免責聲明",
    disclaimerText:
      "本工具僅供學習和研究使用，請勿用於商業用途。解析所得內容的版權歸原作者所有。",
    firstUseTitle: "使用說明",
    firstUseDesc:
      "本工具透過 API 解析抖音分享連結來取得無浮水印影片直鏈。所有解析均在伺服端完成，不會收集任何使用者資訊。",
    agree: "我已了解，開始使用",
    disclaimerItem1: "請勿將下載的影片用於商業用途",
    disclaimerItem2: "請尊重原創作者的智慧財產權",
    disclaimerItem3: "所有影片版權歸原作者所有",
    disclaimerItem4: "使用本工具所產生的一切後果由使用者自行承擔",
  },

  // === B站下載 ===
  bilidown: {
    inputPlaceholder: "輸入 B 站影片連結或 BV 號...",
    parseNow: "立即解析",
    parsing: "解析中...",
    parseFailed: "解析失敗",
    advancedSettings: "進階設定",
    cookiePlaceholder: "貼上完整 Cookie 以啟用高畫質解析...",
    cookieTip:
      "填寫 Cookie 後可解鎖 1080P 及以上畫質。Cookie 僅用於本次請求，不會被儲存。",
    videoStream: "視訊流",
    audioStream: "音訊流",
    mergeDownload: "一鍵合併",
    merging: "合併中...",
    mergeFailed: "合併失敗",
    mergeSuccess: "合併完成",
    disclaimer: "免責聲明",
    disclaimerText:
      "本工具僅供學習和研究使用。解析所得內容的版權歸原作者所有。",
    firstUseTitle: "使用說明",
    firstUseDesc:
      "本工具解析 Bilibili 影片連結，取得音視訊直鏈。內建 FFmpeg WASM 引擎，支援在瀏覽器中一鍵合併影片和音訊。",
    agree: "我已了解，開始使用",
    disclaimerItem1: "請勿將下載的影片用於商業用途",
    disclaimerItem2: "請尊重原創作者的智慧財產權",
    disclaimerItem3: "所有影片版權歸原作者和 Bilibili 所有",
    disclaimerItem4: "使用本工具所產生的一切後果由使用者自行承擔",
    disclaimerItem5: "合併功能使用瀏覽器端 FFmpeg，不會上傳任何資料",
    quality: "畫質",
    codec: "編碼",
    selectVideo: "選擇視訊流",
    selectAudio: "選擇音訊流",
  },

  // === 歌詞 ===
  lyric: {
    searchPlaceholder: "搜尋歌名或歌手...",
    searching: "搜尋中...",
    searchFailed: "搜尋失敗",
    noResults: "暫無搜尋結果",
    loading: "載入中...",
    loadFailed: "歌詞載入失敗",
    noLyric: "暫無歌詞",
    downloadLrc: "下載 LRC",
    copyLyric: "複製歌詞",
    timeline: "時間軸",
    lyricMode: "純文字",
    singer: "歌手",
    album: "專輯",
    duration: "時長",
  },

  // === 天氣 ===
  weather: {
    searchPlaceholder: "輸入城市名稱...",
    searching: "搜尋中...",
    searchFailed: "搜尋失敗",
    noResults: "未找到相關城市",
    currentWeather: "目前天氣",
    hourlyForecast: "24小時預報",
    dailyForecast: "未來天氣",
    temperature: "溫度",
    humidity: "濕度",
    windSpeed: "風速",
    feelsLike: "體感溫度",
    precipitation: "降水量",
    uvIndex: "紫外線指數",
    sunrise: "日出",
    sunset: "日落",
    searchTip:
      "Tip: 由於使用非本土化介面，搜尋不到國內城市時，可嘗試使用拼音。例如：beijing 代替北京",
  },

  // === 王者榮耀 ===
  hok: {
    hero: "英雄",
    item: "裝備",
    skill: "技能",
    heroes: "英雄",
    items: "裝備",
    summoner: "召喚師技能",
    all: "全部",
    searchHero: "搜尋英雄名稱...",
    searchItem: "搜尋裝備名稱...",
    searchSkill: "搜尋技能名稱...",
    searchSummoner: "搜尋技能...",
    allRoles: "全部",
    warrior: "戰士",
    mage: "法師",
    tank: "坦克",
    assassin: "刺客",
    marksman: "射手",
    support: "輔助",
    attack: "攻擊",
    magic: "法術",
    defense: "防禦",
    movement: "移動",
    jungle: "打野",
    roam: "遊走",
    heroDetail: "英雄詳情",
    skins: "造型",
    skills: "技能",
    cooldown: "冷卻：",
    manaCost: "耗藍",
    gold: "金幣",
    unknown: "未知",
    loadFailed: "資料載入失敗",
    resultCount: "共 {count} 個結果",
  },

  // === Playground ===
  playground: {
    run: "執行",
    clear: "清空",
    console: "主控台",
    template: "範本",
    javascript: "JavaScript",
    typescript: "TypeScript",
  },
};
