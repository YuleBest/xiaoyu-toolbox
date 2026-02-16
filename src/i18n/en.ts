export default {
  // === Common ===
  common: {
    appName: "Xiaoyu Toolbox",
    back: "Back",
    search: "Search",
    searchTools: "Search tools",
    copy: "Copy",
    copySuccess: "Copied",
    copyFailed: "Copy failed",
    clear: "Clear",
    clearAll: "Clear all",
    download: "Download",
    downloadSuccess: "Downloaded",
    upload: "Upload",
    export: "Export",
    import: "Import",
    delete: "Delete",
    remove: "Remove",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    viewMore: "View more",
    chars: "chars",
    approx: "≈",
  },

  // === Navigation ===
  nav: {
    home: "Home",
    allTools: "All Tools",
    about: "About",
    categoriesLabel: "Categories",
    browseCategories: "Browse Categories",
  },

  // === Categories ===
  categories: {
    dev: "Dev Tools",
    image: "Image Tools",
    media: "Media Tools",
    life: "Life Utilities",
    game: "Game Tools",
  },

  // === Theme ===
  theme: {
    label: "Appearance",
    toggle: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  // === Language ===
  lang: {
    label: "Language",
    zhCN: "简体中文",
    zhTW: "繁體中文",
    en: "English",
  },

  // === Home ===
  home: {
    featured: "Featured",
    hot: "Popular",
    latest: "Latest",
  },

  // === Search ===
  search: {
    placeholder: "Search tools, categories, or keywords...",
    startTitle: "Start typing to search",
    startDesc:
      "Search by tool name, description, or subtitle to quickly find what you need.",
    emptyTitle: "No tools found",
    emptyDesc:
      "Try different keywords, or stay tuned for updates. We're adding more tools.",
  },

  // === Footer ===
  footer: {
    email: "Email",
    blog: "Blog",
    copyright: "© 2026 YuleBest. All rights reserved.",
    disclaimer:
      "All tools on this site are for learning and research purposes only. Some resources originate from the internet.",
  },

  // === Tool Container ===
  toolContainer: {
    details: "Details",
    toolInfo: "Tool info",
    description: "Description",
    usage: "Usage Guide",
    author: "Author:",
    publishDate: "Published:",
  },

  // === Tools ===
  tools: {
    base64: {
      title: "Base64 Converter",
      subtitle: "Text ↔ Base64 encoding",
      description:
        "Convert between text and Base64 encoding. Supports UTF-8 characters including Chinese and special symbols.",
      usage:
        "1. Encode: Type text on the left, Base64 appears on the right.\n2. Decode: Paste Base64 on the right, decoded text appears on the left.\n3. Click copy buttons to quickly copy content.",
    },
    "json-yaml": {
      title: "JSON-YAML Converter",
      subtitle: "Config format converter",
      description:
        "Quick and easy JSON ↔ YAML converter with real-time validation and formatting.",
      usage:
        "1. Paste JSON or YAML content.\n2. Click convert to switch formats.\n3. Supports one-click copy and clear.",
    },
    playground: {
      title: "JS Playground",
      subtitle: "In-browser JS/TS sandbox",
      description:
        "Online code playground based on Sandpack and Monaco Editor. Preview JavaScript/TypeScript code execution in real time.",
      usage:
        "1. Write code in the left editor.\n2. Click run to see output in the console.\n3. Switch between JS/TS templates.",
    },
    qrcode: {
      title: "QR Code",
      subtitle: "Generate & scan QR codes",
      description:
        "Generate custom QR codes or scan QR codes from images. Supports downloading generated QR code images.",
      usage:
        '1. Generate: Enter text in the "Generate" tab to preview QR code in real time.\n2. Scan: Upload or drag a QR code image in the "Scan" tab to decode it.',
    },
    exif: {
      title: "EXIF Viewer",
      subtitle: "View image metadata",
      description:
        "Read and display image EXIF metadata including camera info, shooting parameters, GPS location, and more.",
      usage:
        '1. Upload: Click "Select an image" to choose a local image file.\n2. View: EXIF data is automatically parsed and displayed in the table below.\n3. Preview: An image preview is shown for reference.',
    },
    dydown: {
      title: "Douyin Parser",
      subtitle: "Watermark-free video download",
      description:
        "Parse Douyin share links to get watermark-free video direct links and author info.",
      usage:
        '1. Copy the share link from the Douyin app.\n2. Paste it into the input box and click "Parse".\n3. Get download links or download the video directly.',
    },
    bilidown: {
      title: "Bilibili Parser",
      subtitle: "Audio/video merge & download",
      description:
        "Parse Bilibili video links to get audio/video direct links. Built-in FFmpeg WASM engine for in-browser merge. Add Cookie for 1080P+ quality.",
      usage:
        '1. Copy the Bilibili video link (BV ID).\n2. Paste and click "Parse Now".\n3. For HD quality, add your Cookie in advanced settings.\n4. Click "Merge & Download" to merge and download the mp4 file.',
    },
    lyric: {
      title: "Lyrics Finder",
      subtitle: "Search & download lyrics",
      description:
        "Search songs and get standard LRC format lyrics. Supports download and copy. Powered by KuGou Music data source.",
      usage:
        "1. Enter a song or artist name to search.\n2. Select the target song from results.\n3. View lyrics, download LRC file, or copy lyrics text.",
    },
    weather: {
      title: "Weather",
      subtitle: "Real-time weather query",
      description:
        "Global weather query tool based on Open-Meteo. View current weather, hourly forecasts, and future weather trends.",
      usage:
        "1. Enter a city name (pinyin or English) to search.\n2. Select the correct city.\n3. View detailed weather information.\n\nTip: For Chinese cities, try using pinyin if the search returns no results. e.g., beijing instead of 北京",
    },
    hok: {
      title: "HOK Query",
      subtitle: "Heroes, items & skills",
      description:
        "Honor of Kings game data query tool. Look up hero info, item attributes, and summoner skill details. Includes complete skin lists, item effects, and skill cooldowns.",
      usage:
        "1. Select a category: Heroes, Items, or Summoner Skills.\n2. Use the search box for quick lookup.\n3. Hero query supports role filtering (Warrior, Mage, Tank, etc.).\n4. Item query supports type filtering (Attack, Magic, Defense, etc.).\n5. Click a hero card to view details and skin list.",
    },
    reaction: {
      title: "Reaction Test",
      subtitle: "Millisecond-level reaction test",
      description:
        "Test your visual reaction speed. Click or press space as fast as you can when the screen turns green. Note: This is for entertainment only; mouse/keyboard devices may introduce input latency.",
      usage:
        "1. Click anywhere or press space to start.\n2. Wait for the screen to turn red, stay focused.\n3. Click or press space immediately when it turns green!\n4. Check your millisecond-level reaction data.",
    },
  },

  // === Base64 Page ===
  base64: {
    source: "Source",
    sourceLength: "Source length",
    fileMode: "File mode",
    fileLoaded: " loaded",
    encodeError: "Encoding error",
    decodeError: "Decoding error",
    copySource: "Copy source",
    copyBase64: "Copy Base64",
    downloadBase64: "Download Base64",
    uploadFile: "File to Base64",
    uploading: "Reading...",
    fileSizeLimit: "File size cannot exceed 20MB",
    fileReadError: "Failed to read file",
    loadedAsBase64: "Loaded as raw Base64 data",
    removeFile: "Remove file",
    contentHidden: "Content hidden (too long)",
    contentHiddenDesc:
      "Character count exceeds 10,000. Content is hidden to prevent page lag. Use download or copy buttons.",
    showAll: "Show all ({count} chars)",
    inputPlaceholder: "Enter text to encode...",
    base64Placeholder: "Enter Base64 string to decode...",
    tip: "Tip: This tool supports bidirectional conversion. Enter text on the left for Base64 encoding; enter Base64 on the right for decoding.",
  },

  // === JSON-YAML Page ===
  jsonYaml: {
    importFile: "Import file",
    formatJson: "Format JSON",
    jsonPlaceholder: "Enter JSON content...",
    yamlPlaceholder: "Enter YAML content...",
    exportJson: "Export JSON",
    exportYaml: "Export YAML",
    copyJson: "Copy JSON",
    copyYaml: "Copy YAML",
    fileSizeLimit: "File size cannot exceed 5MB",
    importSuccess: "Imported",
    exporting: "Exporting file...",
    formatSuccess: "Formatted",
    formatError: "Invalid JSON, cannot format",
    tip: "Tip: Supports bidirectional real-time conversion, import, and file export. Syntax errors are shown below.",
  },

  // === QR Code Page ===
  qrcode: {
    generateTab: "Generate QR",
    scanTab: "Scan QR",
    contentType: "Content Type",
    text: "Text",
    link: "Link",
    wifi: "WiFi",
    mail: "Email",
    inputContent: "Input Content",
    textPlaceholder: "Enter text content...",
    linkPlaceholder: "Enter URL (e.g., https://yule.ink)...",
    wifiSsid: "Network Name (SSID)",
    wifiSsidPlaceholder: "WiFi name",
    securityType: "Security Type",
    noPassword: "None",
    password: "Password",
    wifiPasswordPlaceholder: "WiFi password",
    hiddenNetwork: "Hidden network",
    recipient: "Recipient",
    subjectOptional: "Subject (optional)",
    subjectPlaceholder: "Email subject",
    bodyLabel: "Body",
    bodyPlaceholder: "Email body...",
    appearance: "Appearance",
    errorLevel: "Error Correction",
    errorLevelDesc:
      "L: 7%, M: 15%, Q: 25%, H: 30%. Higher levels tolerate partial obstruction.",
    qrColor: "QR Color",
    margin: "Margin",
    size: "Size",
    preview: "Live Preview",
    waitInput: "Waiting for input...",
    saveQr: "Save QR Code",
    transparentWarning:
      "Transparent areas may not scan in dark mode. Use default background.",
    wifiWarning:
      "💡 WiFi QR codes may fail to scan on some devices due to protocol differences. Ensure SSID and password are correct.",
    generateFailed: "Failed to generate QR code",
    scanOrUpload: "Scan or upload image",
    dragOrClick: "Drag an image here, or click the button below",
    selectImage: "Select image",
    imageSizeLimit: "Image size cannot exceed 10MB",
    scanSuccess: "Parsed successfully",
    noQrFound: "No QR code found",
    scanResult: "Scan Result",
    copyContent: "Copy content",
    visitLink: "Visit link",
  },

  // === EXIF Page ===
  exif: {
    selectOrDrag: "Select or drag an image",
    supportedFormats: "Supports JPG, PNG, HEIC and more, auto-reads EXIF",
    selectImage: "Select image",
    parsing: "Parsing EXIF data...",
    selectFirst: "Please select an image first",
    noExif: "This image does not contain EXIF data",
    parseSuccess: "EXIF parsed successfully",
    parseFailed: "EXIF parsing failed. The image format may not be supported",
    fileSizeLimit: "File size cannot exceed 50MB",
    dragImageOnly: "Please drag an image file",
    copyJson: "Copy JSON",
    copiedJson: "Copied as JSON",
    exportJson: "Exporting JSON",
    changeImage: "Try another",
    replaceImage: "Replace image",
    unknownDevice: "Unknown device",
    exifDetails: "EXIF Details",
    totalItems: "{count} items",
    hideInvalid: "Hide invalid",
    field: "Field",
    value: "Value",
    action: "Action",
    copied: "Copied {label}",
    copyItem: "Copy this item",
    fields: {
      ImageWidth: "Image Width",
      ImageHeight: "Image Height",
      Make: "Camera Make",
      Model: "Camera Model",
      Orientation: "Orientation",
      XResolution: "X Resolution",
      YResolution: "Y Resolution",
      ResolutionUnit: "Resolution Unit",
      ModifyDate: "Modify Date",
      YCbCrPositioning: "YCbCr Positioning",
      ExposureTime: "Exposure Time",
      FNumber: "F-Number",
      ExposureProgram: "Exposure Program",
      ISO: "ISO",
      ExifVersion: "Exif Version",
      DateTimeOriginal: "Date/Time Original",
      CreateDate: "Create Date",
      OffsetTimeOriginal: "Offset Time Original",
      ComponentsConfiguration: "Components Configuration",
      ShutterSpeedValue: "Shutter Speed",
      ApertureValue: "Aperture Value (APEX)",
      BrightnessValue: "Brightness",
      ExposureCompensation: "Exposure Compensation",
      MaxApertureValue: "Max Aperture",
      MeteringMode: "Metering Mode",
      LightSource: "Light Source",
      Flash: "Flash",
      FocalLength: "Focal Length",
      SubSecTime: "Sub-second Time",
      SubSecTimeOriginal: "Sub-second Time Original",
      SubSecTimeDigitized: "Sub-second Time Digitized",
      FlashpixVersion: "FlashPix Version",
      ColorSpace: "Color Space",
      ExifImageWidth: "Exif Image Width",
      ExifImageHeight: "Exif Image Height",
      SensingMethod: "Sensing Method",
      SceneType: "Scene Type",
      ExposureMode: "Exposure Mode",
      WhiteBalance: "White Balance",
      DigitalZoomRatio: "Digital Zoom Ratio",
      FocalLengthIn35mmFormat: "35mm Focal Length",
      SceneCaptureType: "Scene Capture Type",
      LensModel: "Lens Model",
      GPSLatitude: "GPS Latitude",
      GPSLongitude: "GPS Longitude",
      GPSAltitudeRef: "GPS Altitude Ref",
      GPSAltitude: "GPS Altitude",
      GPSTimeStamp: "GPS Timestamp",
      GPSProcessingMethod: "GPS Processing Method",
      latitude: "Latitude (parsed)",
      longitude: "Longitude (parsed)",
      InteropIndex: "Interop Index",
      InteropVersion: "Interop Version",
      Software: "Software",
      ColorType: "Color Type",
      BitDepth: "Bit Depth",
      ImageDescription: "Image Description",
      Compression: "Compression",
      Filter: "Filter",
      Interlace: "Interlace",
      ImageUniqueID: "Image Unique ID",
    },
  },

  // === Reaction Test ===
  reaction: {
    waiting: {
      title: "Reaction Time Test",
      subtitle: "Click as fast as you can when green",
      hint: "Click anywhere to start",
    },
    ready: {
      title: "Wait for green...",
      subtitle: "Stay focused",
    },
    now: {
      title: "Click!!!",
    },
    result: {
      title: "Your Result",
      subtitle: "Click to try again",
    },
    early: {
      title: "Too early!",
      subtitle: "Wait for the screen to turn green",
      hint: "Click anywhere to restart",
    },
    rank: {
      cheat: "Are you cheating???",
      king: "🏆 Legendary King",
      star: "⭐ Supreme Star",
      diamond: "💎 Eternal Diamond",
      gold: "🥇 Glorious Gold",
      bronze: "🥉 Stubborn Bronze",
      afk: "💤 AFK?",
    },
  },

  // === Douyin Download ===
  dydown: {
    inputPlaceholder: "Paste Douyin share link...",
    parse: "Parse",
    parsing: "Parsing...",
    parseFailed: "Parse failed",
    author: "Author",
    downloadVideo: "Download video",
    downloadAudio: "Download audio",
    disclaimer: "Disclaimer",
    disclaimerText:
      "This tool is for learning and research only. Copyright of parsed content belongs to the original author.",
    firstUseTitle: "Instructions",
    firstUseDesc:
      "This tool parses Douyin share links via API to get watermark-free video direct links. All parsing is done server-side and no user data is collected.",
    agree: "I understand, start using",
    disclaimerItem1: "Do not use downloaded videos for commercial purposes",
    disclaimerItem2:
      "Please respect the intellectual property of original creators",
    disclaimerItem3: "All video copyrights belong to the original authors",
    disclaimerItem4:
      "All consequences arising from the use of this tool are borne by the user",
  },

  // === Bilibili Download ===
  bilidown: {
    inputPlaceholder: "Enter Bilibili video link or BV ID...",
    parseNow: "Parse Now",
    parsing: "Parsing...",
    parseFailed: "Parse failed",
    advancedSettings: "Advanced Settings",
    cookiePlaceholder: "Paste full Cookie to enable HD parsing...",
    cookieTip:
      "Adding a Cookie unlocks 1080P+ quality. Cookie is only used for this request and won't be stored.",
    videoStream: "Video Stream",
    audioStream: "Audio Stream",
    mergeDownload: "Merge & Download",
    merging: "Merging...",
    mergeFailed: "Merge failed",
    mergeSuccess: "Merge complete",
    disclaimer: "Disclaimer",
    disclaimerText:
      "This tool is for learning and research only. Copyright of parsed content belongs to the original author.",
    firstUseTitle: "Instructions",
    firstUseDesc:
      "This tool parses Bilibili video links to get audio/video direct links. Built-in FFmpeg WASM engine for in-browser merge.",
    agree: "I understand, start using",
    disclaimerItem1: "Do not use downloaded videos for commercial purposes",
    disclaimerItem2:
      "Please respect the intellectual property of original creators",
    disclaimerItem3:
      "All video copyrights belong to the original authors and Bilibili",
    disclaimerItem4:
      "All consequences arising from the use of this tool are borne by the user",
    disclaimerItem5:
      "The merge feature uses browser-side FFmpeg and does not upload any data",
    quality: "Quality",
    codec: "Codec",
    selectVideo: "Select video stream",
    selectAudio: "Select audio stream",
  },

  // === Lyrics ===
  lyric: {
    searchPlaceholder: "Search song or artist...",
    searching: "Searching...",
    searchFailed: "Search failed",
    noResults: "No results found",
    loading: "Loading...",
    loadFailed: "Failed to load lyrics",
    noLyric: "No lyrics available",
    downloadLrc: "Download LRC",
    copyLyric: "Copy lyrics",
    timeline: "Timeline",
    lyricMode: "Plain text",
    singer: "Artist",
    album: "Album",
    duration: "Duration",
  },

  // === Weather ===
  weather: {
    searchPlaceholder: "Enter city name...",
    searching: "Searching...",
    searchFailed: "Search failed",
    noResults: "No cities found",
    currentWeather: "Current Weather",
    hourlyForecast: "24h Forecast",
    dailyForecast: "Daily Forecast",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    feelsLike: "Feels Like",
    precipitation: "Precipitation",
    uvIndex: "UV Index",
    sunrise: "Sunrise",
    sunset: "Sunset",
    searchTip:
      "Tip: For Chinese cities, try using pinyin if the search returns no results. e.g., beijing instead of 北京",
  },

  // === Honor of Kings ===
  hok: {
    hero: "Heroes",
    item: "Items",
    skill: "Skills",
    heroes: "Heroes",
    items: "Items",
    summoner: "Summoner Skills",
    all: "All",
    searchHero: "Search heroes...",
    searchItem: "Search items...",
    searchSkill: "Search skills...",
    searchSummoner: "Search skills...",
    allRoles: "All",
    warrior: "Warrior",
    mage: "Mage",
    tank: "Tank",
    assassin: "Assassin",
    marksman: "Marksman",
    support: "Support",
    attack: "Attack",
    magic: "Magic",
    defense: "Defense",
    movement: "Movement",
    jungle: "Jungle",
    roam: "Roaming",
    heroDetail: "Hero Details",
    skins: "Skins",
    skills: "Skills",
    cooldown: "CD: ",
    manaCost: "Mana Cost",
    gold: "Gold",
    unknown: "Unknown",
    loadFailed: "Failed to load data",
    resultCount: "{count} results",
  },

  // === Playground ===
  playground: {
    run: "Run",
    clear: "Clear",
    console: "Console",
    template: "Template",
    javascript: "JavaScript",
    typescript: "TypeScript",
  },
};
