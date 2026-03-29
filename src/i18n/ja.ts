export default {
  // === Common ===
  common: {
    appName: 'Xiaoyu Toolbox',
    all: '全部',
    back: '戻る',
    search: '検索',
    searchTools: '全 {count} 件のツールを検索',
    copy: 'コピー',
    copySuccess: 'コピーしました',
    copyFailed: 'コピーに失敗しました',
    clear: 'クリア',
    clearAll: 'すべてクリア',
    download: 'ダウンロード',
    downloadSuccess: 'ダウンロード完了',
    upload: 'アップロード',
    export: 'エクスポート',
    import: 'インポート',
    delete: '削除',
    remove: '削除',
    cancel: 'キャンセル',
    confirm: '確定',
    close: '閉じる',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    viewMore: 'もっと見る',
    chars: '文字',
    approx: '約',
    reset: 'リセット',
    settings: '設定',
    tips: 'ヒント',
    updateLog: {
      title: '最近の更新',
      collapse: '閉じる',
      expand: '残り {count} 件の履歴を展開',
    },
  },

  // === Navigation ===
  nav: {
    home: 'ホーム',
    allTools: 'すべてのツール',
    about: 'このサイトについて',
    categoriesLabel: 'カテゴリ',
    browseCategories: 'カテゴリを表示',
  },

  // === Categories ===
  categories: {
    dev: '開発ツール',
    media: 'メディア',
    life: '生活・実用',
    game: 'ゲーム',
  },

  // === Theme ===
  theme: {
    label: '表示モード',
    toggle: 'テーマを切り替え',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム設定に従う',
  },

  // === Language ===
  lang: {
    label: '言語',
    zhCN: '简体中文',
    zhTW: '繁體中文',
    en: 'English',
    ja: '日本語',
  },

  home: {
    favorites: 'お気に入り',
    featured: 'おすすめ',
    hot: '人気ツール',
    latest: '新着',
  },

  // === Search Page ===
  search: {
    placeholder: '全 {count} 件のツール、カテゴリ、キーワードで検索...',
    startTitle: 'キーワードを入力して検索',
    startDesc: 'ツール名や機能説明から検索できます。',
    emptyTitle: 'ツールが見つかりませんでした',
    emptyDesc: '別のキーワードを試すか、今後のアップデートをお待ちください。',
  },

  // === Footer ===
  footer: {
    email: 'メール',
    blog: 'ブログ',
    copyright: '© 2026 YuleBest. All rights reserved.',
    disclaimer: '提供されるすべてのツールは学習および研究目的のみに使用してください。',
  },

  // === Meta Information ===
  meta: {
    home: {
      title: 'オープンソース、無料、広告なしのオンラインツールボックス',
      description:
        '数多くの実用的なツールを集めたオンラインツールボックス。Base64、JSON変換、QRコード生成、EXIF表示、動画解析など。ミニマルデザインで即座に使用可能。',
      keywords:
        'オンラインツール, ツールボックス, Xiaoyu Toolbox, 効率化ツール, 開発者ツール, 画像ツール',
    },
  },

  // === Tool Container ===
  toolContainer: {
    details: '詳細',
    toolInfo: 'ツールの詳細',
    description: '説明',
    usage: '使い方案内',
    author: '作成者:',
    publishDate: '公開日:',
    favorite: 'お気に入りに追加',
    unfavorite: 'お気に入りから削除',
  },

  // === Tools List ===
  tools: {
    adoc: {
      title: '行政区画コード',
      subtitle: '中国大陸行政区画検索',
      description:
        '中国大陸の省、市、県、街道の4レベル行政区画コードを検索。階層選択とキーワード検索に対応し、対象エリアを素早く特定して完全な行政区画コードを取得。',
      usage:
        '1. ドロップダウンメニューで省、市、県、街道を順番に選択。\n2. または検索ボックスにキーワードを入力して素早く検索。\n3. 選択後に完全な住所パスと行政区画コードが表示されます。',
    },
    'url-encode': {
      title: 'URL エンコード',
      subtitle: 'URL エンコードとデコード',
      description:
        '文字列を URL エンコード、または URL エンコードされたテキストをデコードします。完全な URL エンコード（encodeURIComponent）に対応。',
      usage:
        '1. エンコード：左側にテキストを入力すると、右側に URL エンコード結果が表示されます。\n2. デコード：右側に URL エンコード文字列を入力すると、左側にデコードされたテキストが表示されます。\n3. コピーボタンをクリックして素早くコンテンツをコピー可能。',
    },
    unicode: {
      title: 'Unicode 変換',
      subtitle: 'Unicode エンコードとデコード',
      description:
        '文字列を Unicode エスケープシーケンス（\\uXXXX）に変換したり、元に戻したりします。',
      usage:
        '1. エンコード：左側にテキストを入力すると、右側に Unicode 変換結果が表示されます。\n2. デコード：右側に Unicode 文字列（例：\\u4f60\\u597d）を入力すると、左側に元のテキストが表示されます。\n3. コピーボタンをクリックして素早くコンテンツをコピー可能。',
    },
    base64: {
      title: 'Base64 変換',
      subtitle: 'テキストと Base64 の相互変換',
      description:
        'テキストと Base64 エンコードの相互変換。UTF-8 中国語や特殊文字にも対応し、文字化けを防止。データエンコーディング、URL 安全伝送、バイナリデータテキスト表現、開発デバッグに最適。開発者と日常使用の必須ツールです。',
      usage:
        'どちらの側に入力しても自動変換されます。コピーボタンをクリックして素早くコンテンツをコピー可能。',
    },
    'json-yaml': {
      title: 'JSON-YAML 変換',
      subtitle: '設定フォーマットの相互変換',
      description:
        'JSON と YAML を素早く変換する便利なツール。リアルタイム検証と書式美化に対応。設定ファイル変換、API データフォーマット切り替え、開発デバッグなど様々なシーンで活用でき、作業効率を向上させます。',
      usage:
        'JSON または YAML コンテンツを貼り付けて変換ボタンをクリックするだけで変換できます。ワンクリックコピーとクリアもサポート。',
    },
    playground: {
      title: 'JS プレイグラウンド',
      subtitle: 'ブラウザ内 JS / TS サンドボックス',
      description:
        'Sandpack と Monaco Editor をベースにしたオンラインコードプレイグラウンド。JavaScript/TypeScript コードの実行結果をリアルタイムでプレビューできます。ローカル環境の設定不要で、ブラウザ内でコードの作成、テスト、デバッグが可能。クイックプロトタイピング、コード片の共有、プログラミング学習に最適です。',
      usage:
        '左側エディタで JS/TS コードを作成し、実行ボタンをクリックするとログパネルに出力が表示されます。JS/TS 実行環境の切り替えもサポート。',
    },
    qrcode: {
      title: 'QRコードツール',
      subtitle: '生成と読み取り、スタイル編集',
      description:
        'カスタムQRコードを素早く生成したり、画像内のQRコード内容を認識したりできます。テキスト、リンク、WiFi、メールなど複数のコンテンツタイプ、エラー修正レベル調整、サイズと色のカスタマイズ、生成したQRコード画像のダウンロードをサポート。あらゆるシーンのニーズに対応します。',
      usage:
        '生成：「生成」タブでテキストを入力するとQRコードをリアルタイムプレビュー。読み取り：「読み取り」タブでQRコード画像をアップロードまたはドラッグすると解析結果を取得。',
    },
    exif: {
      title: '画像 EXIF 表示',
      subtitle: 'メタデータの確認',
      description:
        '画像の EXIF メタデータを読み取り表示します。カメラブランド・モデル、撮影パラメータ（絞り、シャッター速度、ISO）、GPS 地理位置情報、撮影時間など詳細情報を含みます。一般的な画像フォーマットをサポートし、写真作品分析、画像トレーサビリティ、メタデータ閲覧に適しています。',
      usage:
        '画像をアップロード：「画像を選択」ボタンをクリックしてローカル画像ファイルを選択。情報を表示：アップロード後、EXIF データを自動解析し、下の表に表示。プレビュー：画像プレビューが表示され、確認に便利。',
    },
    dydown: {
      title: 'Douyin 動画解析',
      subtitle: '透かしなし動画保存',
      description:
        'Douyin 共有リンクを解析し、透かしなしの動画ダイレクトリンクと作成者情報を取得します。透かし除去ダウンロード、動画サムネイル抽出、作成者情報閲覧をサポート。コンテンツバックアップ、セカンダリクリエイション、動画素材収集に最適です。',
      usage:
        '1. Douyin アプリで共有リンクをコピー。\n2. 入力ボックスに貼り付け、「解析」をクリック。\n3. ダウンロードリンクを取得するか、動画を直接ダウンロード。',
    },
    bilidown: {
      title: 'BiliBili 動画解析',
      subtitle: 'ストリーム統合と保存',
      description:
        'Bilibili 動画リンクを解析し、音声とビデオのダイレクトストリームを取得。組み込み FFmpeg WASM エンジンでブラウザ内でワンクリック動画と音声のマージをサポート。Cookie 入力で 1080P+ 高解像度解析を有効化。Bilibili 動画ダウンロード、高画質動画保存、オフライン視聴に最適です。',
      usage:
        '1. Bilibili 動画リンク（BV番号）をコピー。\n2. 入力ボックスに貼り付け、「今すぐ解析」をクリック。\n3. 高画質が必要な場合、詳細設定で完全な Cookie を入力。\n4. 「ワンクリックマージ」をクリックするとブラウザ内で自動的にマージされ mp4 ファイルがダウンロードされます。',
    },
    lyric: {
      title: '歌詞取得',
      subtitle: '検索とダウンロード',
      description:
        '曲名から標準 LRC 形式の歌詞を検索・ダウンロードできます。Kugou 音楽データソースをベースに、豊富な歌詞リソースを提供。カラオケ制作、ミュージックプレーヤー歌詞同期、歌詞コレクション、歌曲学習に最適です。',
      usage:
        '1. 曲名またはアーティスト名を入力して検索。\n2. 検索結果から対象曲を選択。\n3. 歌詞内容を確認し、LRC ファイルダウンロードまたは歌詞テキストコピーをサポート。',
    },
    weather: {
      title: '天気',
      subtitle: '世界中の天気予報',
      description:
        'QWeather を利用した全球天気検索ツール。リアルタイム天気、時間ごとの予報、今後の天気トレンドを確認できます。温度、湿度、風速、気圧、降水確率など包括的な情報を提供し、旅行計画、生活スケジュール、旅行準備に最適です。',
      usage:
        '1. 都市名（中国語ピンインまたは英語対応）を入力して検索。\n2. 正しい都市を選択。\n3. 詳細な天気情報を確認。\n\nヒント: 非ローカライズ API 使用のため、中国国内都市が見つからない場合はピンインをお試しください。例: 北京の代わりに beijing',
    },
    hok: {
      title: '王者栄耀 (Honor of Kings)',
      subtitle: 'ゲームデータの検索',
      description:
        '王者栄耀ゲームデータ検索ツール。ヒーロー情報、装備属性、サモナースキル詳細のクエリをサポート。完全なヒーロースキンリスト、装備効果説明、スキルクールダウン時間など詳細情報を含む。プレイヤーがゲームキャラクター、装備効果、スキル特性を理解し、ゲーム戦術とヒーロー使用テクニックを向上させるのに最適です。',
      usage:
        '1. クエリカテゴリを選択：ヒーロー、装備、またはサモナースキル。\n2. 検索ボックスでキーワードを入力して素早く検索。\n3. ヒーロークエリは職業によるフィルタリングをサポート（戦士、メイジ、タンクなど）。\n4. 装備クエリはタイプによるフィルタリングをサポート（攻撃、魔法、防御など）。\n5. ヒーローカードをクリックして詳細情報とスキンリストを表示。',
    },
    reaction: {
      title: '反応速度テスト',
      subtitle: 'ミリ秒単位の測定',
      description:
        '視覚的反応速度をテストします。画面が緑になったらできるだけ早く画面をクリックまたはスペースキーを押してください。注意：このテストは娯楽目的のみで、マウスまたはキーボードデバイスにより追加の入力遅延が発生する可能性があります。楽しいチャレンジ、自己評価、友人との反応速度比較に最適です。',
      usage:
        '1. 画面の任意の領域をクリックするかスペースキーを押してテスト開始。\n2. 画面が赤くなるまで待ち、集中を維持。\n3. 画面が緑になったらすぐにクリックまたはスペースキーを押す！\n4. ミリ秒単位の反応データを確認。',
    },
    jichacha: {
      title: '機査査 (JiChacha)',
      subtitle: 'デバイス情報の検索',
      description:
        'スマートフォンモデルの詳細パラメータ、コードネーム、市場名などを検索できます。世界の主要ブランドのスマートフォン、タブレット、スマートウォッチなどのデバイス検索をサポート。ハードウェア仕様、発売日、モデル別名など包括的なデータを提供。デバイス選択と仕様比較に便利な実用ツールです。',
      usage: 'デバイスキーワード（例: iPhone 14, SM-S9180）を入力して検索',
      searchPlaceholder: 'モデル/コード/別名...',
      brands: '人気ブランド',
      totalModels: 'モデル',
      noResults: '一致するデバイスが見つかりません',
      filterType: 'フィルタータイプ',
      dtypes: {
        mob: 'スマートフォン',
        pad: 'タブレット',
        tv: 'テレビ',
        watch: 'スマートウォッチ',
        computer: 'コンピュータ',
        band: 'バンド',
        device: '提携デバイス',
        pod: 'Pod',
        tv_hub: 'TVボックス',
      },
    },
    mcpe: {
      title: 'MC PE ダウンロード',
      subtitle: 'Minecraft PE 全バージョン',
      description:
        'Minecraft PE（Minecraft Pocket Edition）全バージョンインストーラーパッケージの閲覧とダウンロード。公式リリース版、ベータ版、過去バージョンなど複数チャネルのダウンロードリンクを提供。バージョンフィルタリングとクイックロケーションをサポート。Minecraft プレイヤーがゲームインストールパッケージを入手する便利なツールです。',
      usage:
        '1. 検索ボックスで必要なバージョン番号をフィルタリング。\n2. バージョンカードをクリックして各チャネルのインストーラーパッケージを表示またはダウンロード。\n3. リリース版とベータ版 (Beta) の区別に注意。',
    },
    'translator-ai': {
      title: '翻訳 (内蔵 AI)',
      subtitle: 'Chrome 公式 AI 翻訳',
      description:
        'Chrome 131+ の組み込み AI 翻訳 API を使用した、プライバシー重視の翻訳ツールです。オンラインでテキストをアップロードする必要がなく、プライバシーを保護し、迅速な応答が可能。多言語翻訳をサポートし、ドキュメント翻訳、Web コンテンツ変換、クロスランゲージ学習に最適。プライバシーを重視するユーザーに理想的な選択肢です。',
      usage:
        '1. 翻訳するテキストを入力または貼り付け。\n2. 言語検出器が自動的にソース言語を検出。\n3. ターゲット言語を選択（中国語、英語、日本語、フランス語、ロシア語、スペイン語対応）。\n4. 「翻訳」をクリックするか、自動翻訳結果を待つ。',
    },
    codeimg: {
      title: 'コード画像生成',
      subtitle: 'コードを美しい画像に変換',
      description:
        'Carbon のようにコードを美しいスクリーンショット画像に変換します。複数の言語ハイライト、テーマ切り替え、カスタム背景とウィンドウスタイルをサポート。技術ブログの挿絵、ソーシャルメディア共有、コードデモンストレーション、教材制作に最適で、コードのプレゼンテーションをより美しくプロフェッショナルにします。',
      usage:
        '1. 左側にコードを入力または貼り付け。\n2. 右側でコード言語、テーマ、背景色またはグラデーションを調整。\n3. 画像をコピーまたはダウンロード。',
    },
    hhsh: {
      title: '好好説話 (Speak Nicely)',
      subtitle: 'ピンイン略語辞典',
      description:
        'awsl、xswl、yyds など中国のネット用語（ピンイン略語）の意味を検索できます。新しいエントリの提出もサポート。ネットスラングの理解、ソーシャルメディアコミュニケーション、ネット文化学習、日常のネットサーフィンに最適で、若者の黒い言葉を理解するお手伝いをします。',
      usage:
        '1. 入力ボックスにピンイン略語を入力。\n2. クエリをクリックして可能な意味解析を取得。\n3. 頻度データベースにない場合は、翻訳の完成を手伝うことができます。\nAPI ソース: https://lab.magiconch.com',
    },
    exchange: {
      title: '為替レート',
      subtitle: 'リアルタイム変換と推移',
      description:
        'Frankfurter API をベースにしたリアルタイム為替レート検索ツール。世界の主要通貨間の変換クエリと過去の為替レート閲覧をサポート。海外旅行、越境EC、外国為替投資、海淘ショッピングなどのシーンに最適。正確な通貨交換参考を提供します。',
      usage:
        '1. 基準通貨とターゲット通貨を選択。\n2. 金額を入力してリアルタイムで変換後の数値を確認。\n3. 日付を切り替えて特定日の過去為替レートをクエリ。\n4. 複数通貨の基準通貨に対するリアルタイム引用を閲覧可能。',
    },
    length: {
      title: '長さ単位換算',
      subtitle: '各単位の相互変換',
      description:
        'メートル法、ヤード・ポンド法、中国・香港の伝統的な単位など一般的な長さ単位の双方向リアルタイム変換をサポート。メートル、キロメートル、センチメートル、ミリメートル、マイル、フィート、インチ、丈、尺、寸など常用単位を網羅。工学計算、学習課題、旅行計画、日常の単位変換ニーズに最適です。',
      usage:
        '1. 上の2つのドロップダウンでそれぞれソース単位とターゲット単位を選択。\n2. ソース単位対応の入力ボックスに長さ数値を入力。\n3. ターゲット単位と下の全常用単位計算パネルが即座に結果を更新。',
    },
    'phone-number': {
      title: '電話番号検索',
      subtitle: '発信元・キャリア情報',
      description:
        '携帯電話番号の所在地域情報（省、市、通信事業者）を検索します。純粋なオフラインデータベースでネットワークリクエスト不要。データベースは https://github.com/zxc7563598/php-mobile-locator より、MIT License。発信者ID確認、迷惑電話識別、電話番号情報照会に最適です。',
      usage:
        '1. 11桁の携帯電話番号を入力。\n2. 検索をクリックするか Enter キーを押す。\n3. 番号所在地域情報（省、市、通信事業者）を確認。',
    },
    bvav: {
      title: 'BV/AV 変換',
      subtitle: 'Bilibili 動画 ID 変換',
      description:
        'Bilibili 動画の BV 番号を AV 番号に変換、または AV 番号を BV 番号に変換します。純粋なフロントエンド操作でネットワークリクエスト不要。B 站ユーザーの動画共有、リンク変換、API 呼び出し、動画管理に最適。B 站愛好家の必須ツールです。',
      usage:
        '1. BV 番号（例: BV17x411w7KC）または AV 番号（例: 170001 または av170001）を入力。\n2. 変換ボタンをクリックまたは Enter キーを押す。\n3. 変換結果を確認し、ワンクリックコピーをサポート。',
    },
    'weibo-hot': {
      title: 'Weibo 熱捜',
      subtitle: 'トレンドランキング',
      description:
        '指定日付の Weibo (微博) 热搜ランキングデータを取得し、項目数によるフィルタリングと元リンクの閲覧をサポート。輿情監視、ホットトピック追跡、コンテンツ作成、ソーシャルメディア分析に最適。全網のホットトピックと討論トレンドを理解するのに役立ちます。',
      usage:
        '1. デフォルトで当日の热搜ランキング（上位50件）を表示。\n2. 上部の日付セレクターをクリックして過去の热搜を閲覧。\n3. ドロップダウンリストで表示項目数を調整可能。\n4. 热搜カードをクリックするとそのトピックの Weibo 热搜ページに直接アクセス。',
      dateSelect: '日付選択',
      historical: 'タイムマシン',
      displayCount: '表示件数',
      show50: '上位50件',
      show100: '上位100件',
      show150: '上位150件',
      showAll: '全て',
      loading: 'データ取得中...',
      fetchFailed: '热搜の取得に失敗または該当日期のデータがありません',
      noResults: '該当日期の热搜データは収録されていません',
      rank: '万',
    },
    period: {
      title: '生理周期管理',
      subtitle: '周期計算シミュレーター',
      description:
        '生理周期の各指標を計算：月経期、卵胞期、排卵日、排卵期、妊娠しやすい時期、黄体期。28日標準周期に基づく計算のみ。女性の健康管理、出産計画、生理周期トラッキング、セルフ健康モニタリングに最適。身体のリズムを理解するのに役立ちます。',
      usage:
        '1. デフォルトでは前回月経の初日を今月1日とする。\n2. 上部の日付セレクターで前回月経初日の日付を変更可能。\n3. 各周期の日数、範囲、対応日付を直感的に確認。',
      lastPeriod: '前回月経初日',
      selectDate: '日付選択',
      today: '今日に戻る',
      phases: {
        menstrual: '月経期',
        follicular: '卵胞期',
        ovulationDay: '排卵日',
        ovulation: '排卵期',
        fertileWindow: '妊娠しやすい時期',
        luteal: '黄体期',
      },
      phaseDesc: {
        menstrual: '1-5日目、合計5日',
        follicular: '6-13日目、合計8日',
        ovulationDay: '14日目、1日',
        ovulation: '9-18日目、排卵日前5日から後4日',
        fertileWindow: '9-15日目、排卵日前5日から後1日',
        luteal: '15-28日目、合計14日',
      },
      legend: '凡例と説明',
      notice:
        '注意：本ツールは標準28日周期に基づいて計算されます。参考用としてご利用ください。医療や避妊の根拠としては使用しないでください。月経周期とは、ある月経の初日から次の月経の初日までの期間を指します。',
    },
    'time-distance': {
      title: '時間距離計算',
      subtitle: '日付間隔の計算',
      description:
        '2つの選択された日付の間の時間を計算します（秒単位）。記念日カウントダウン、プロジェクト周期計算、年齢計算、時間計画などのシーンに最適。日、時間、分、秒まで正確に計算し、時間間隔を把握するのに役立ちます。',
      usage:
        '1. 開始時間と終了時間を選択。\n2. 自動的に計算され、日、時間、分、秒の差が表示されます。',
    },
    'ncm-get-playlist': {
      title: '網易雲プレイリスト',
      subtitle: 'プレイリスト楽曲解析',
      description:
        '網易雲音楽 (NetEase Cloud Music) のプレイリストリンクまたは ID を入力し、プレイリスト内の全曲名とアーティスト情報を取得します。デフォルトインターフェース制限を超えて全量データを抽出。プレイリストバックアップ、音楽整理、曲の発見、プレイリスト移行に最適。完全なプレイリストコンテンツの取得をお手伝いします。',
      usage:
        '1. 網易雲音楽プレイリスト共有リンクをコピーまたは数字 ID を抽出。\n2. 入力ボックスに貼り付け、取得ボタンをクリック。\n3. 完全なプレイリスト曲とアーティストリストを確認し、全テキスト結果のワンクリックコピーをサポート。',
    },
    'hok-voices': {
      title: '王者ボイス',
      subtitle: 'ヒーローボイス鑑賞',
      description:
        '王者栄耀の全ヒーロースキンのロビー、移動、スキル、インタラクションなど全てのボイスラインを収録。オンライン再生をサポートし、ヒーローとスキンでフィルタリング可能。王者栄耀プレイヤーがゲームボイスを鑑賞し、ヒーローの特徴を理解し、セカンダリコンテンツ作成やゲーム文化研究に最適です。',
      usage:
        '1. ヒーロー名をクリックしてヒーローを選択。\n2. ヒーローに複数のスキンがある場合、さらにスキンを選択可能。\n3. 任意のボイスラインカードをクリックして対応するボイスを再生。\n4. 再クリックまたは他のボイスラインをクリックで一時停止/切り替え。\n5. 検索ボックスにキーワードを入力してボイスラインテキストでフィルタリング可能。',
    },
    'statutory-holidays': {
      title: '法定休日',
      subtitle: '2026年 中国法定休日検索',
      description:
        '2026年中国の法定休日と振替出勤日のスケジュールを確認。旅行計画、休暇申請、旅行プラン、仕事と生活の調整に最適。休日期間を事前に把握し、休暇を合理的に活用するのに役立ちます。',
      usage: '各休日の休暇スケジュールと振替出勤日を直接確認できます。',
    },
    poetry: {
      title: '中国古典詩',
      subtitle: '膨大な古典詩の検索',
      description:
        '膨大な中国古典詩をすばやく検索。唐詩、宋詞、元曲など古典作品を収録し、詩名、作者、朝代による検索をサポート。詩詞学習、文化研究、教育引用、伝統文化鑑賞に最適。中国詩詞の美しさを体験できます。',
      usage:
        '1. 検索ボックスに古典詩のタイトルを入力。\n2. ピンインの頭文字を使用してデータベースから迅速に検索。\n3. 簡体字と繁体字の相互変換をサポート。',
    },
    'anime-search': {
      title: '画像でアニメ検索',
      subtitle: 'スクリーンショットからアニメを特定',
      description:
        'アニメのスクリーンショットをアップロードし、trace.moe API を通じて対応するアニメ名、話数、正確な時間点を迅速に検索。アニメファンが未知のアニメを識別し、スクリーンショットの出所を探し、古典作品を発見し、アニメ研究を行うのに最適。ビデオクリップを正確に位置特定します。',
      usage:
        '1. アニメのスクリーンショットをアップロードまたはドラッグ。\n2. 自動的に検索開始（または手動で検索クリック）。\n3. 信頼度、話数、時間点、ビデオプレビューを含む検索結果を確認。',
    },
  },

  // === 画像でアニメ検索 ===
  animeSearch: {
    title: '画像でアニメ検索',
    placeholder: '画像をアップロードまたはドラッグ...',
    uploading: '検索中...',
    searchFailed: '検索に失敗しました',
    noResults: '結果が見つかりませんでした',
    confidence: '一致度',
    episode: '話数',
    time: '時間点',
    videoPreview: 'プレビュー',
    nativeTitle: '原名',
    romajiTitle: 'ローマ字',
    englishTitle: '英名',
    openInAnilist: 'AniList で開く',
    searchQuota: '残額',
    quotaUsed: '本日使用',
    cutBorders: '黒枠を自動カット',
    chineseTitle: '中国語名',
    format: '形式',
    status: '放送状態',
    genres: 'カテゴリー',
    studio: 'アニメーション制作',
    season: '放送时期',
    searchingSource: '検索元画像',
    analysing: 'trace.moe で解析中...',
    anilistInfo: 'AniList 詳細',
    eps: '話',
  },

  // === Time Distance Page ===
  timeDistance: {
    startTime: '開始時間',
    endTime: '終了時間',
    distance: '時間距離',
    resultStr: '{days} 日 {hours} 時間 {minutes} 分 {seconds} 秒',
    skipWeekend: '週末をスキップ',
  },

  // === URL Encode Page ===
  urlEncode: {
    source: '原文',
    encoded: 'URL エンコード',
    encodeError: 'エンコードエラー',
    decodeError: 'デコードエラー',
    copySource: '原文をコピー',
    copyEncoded: 'エンコードをコピー',
    inputPlaceholder: 'エンコードするテキストを入力...',
    encodedPlaceholder: 'デコードするURLエンコード文字列を入力...',
    tip: 'ヒント: 双方向変換に対応しています。左に入力するとエンコード、右に入力するとデコードされます。',
    mode: 'エンコードモード',
    modeComponent: '完全エンコード',
    modeUri: 'URIのみ',
    modeTip:
      "完全エンコード (encodeURIComponent): すべての特殊文字をエンコード、URLパラメータ値に最適。URIのみ (encodeURI): URL構造文字 {'{'}:/?#[]{'@'}{'}'} など) を保持、完全なURLに最適。",
  },

  // === Unicode Page ===
  unicode: {
    source: '原文',
    encoded: 'Unicode 変換',
    encodeError: 'エンコードエラー',
    decodeError: 'デコードエラー',
    copySource: '原文をコピー',
    copyEncoded: 'エンコードをコピー',
    inputPlaceholder: 'エンコードするテキストを入力...',
    encodedPlaceholder: 'デコードする Unicode 文字列を入力...',
    tip: 'ヒント: 双方向変換に対応しています。左に入力するとエンコード、右に入力するとデコードされます。',
  },

  // === Administrative Division Code Page ===
  adoc: {
    searchPlaceholder: '行政区画名またはコードを検索...',
    province: '省級',
    city: '市級',
    district: '区/県級',
    street: '町/街道',
    selectProvince: '省を選択',
    selectCity: '市を選択',
    selectDistrict: '区県を選択',
    selectStreet: '街道を選択',
    selectedInfo: '選択した行政区画',
    fullPath: '完全パス',
    divisionCode: '行政区画コード',
    loadFailed: 'データの読み込みに失敗しました。ページを更新してください',
    tip: 'ヒント: 検索ボックスで素早く検索するか、4段階連動ドロップダウンで順番に選択できます。選択後に完全パスと行政区画コードをコピー可能。',
  },

  // === Base64 Page ===
  base64: {
    source: '原文',
    sourceLength: '文字数',
    fileMode: 'ファイルモード',
    fileLoaded: ' 読み込み成功',
    encodeError: 'エンコードエラー',
    decodeError: 'デコードエラー',
    copySource: '原文をコピー',
    copyBase64: 'Base64をコピー',
    downloadBase64: 'Base64を保存',
    uploadFile: 'ファイルからBase64',
    uploading: '読み込み中...',
    fileSizeLimit: '20MBを超えるファイルは選択できません',
    fileReadError: 'ファイルの読み込みに失敗しました',
    loadedAsBase64: 'Base64データとして読み込まれました',
    removeFile: 'ファイルを削除',
    contentHidden: '内容が長いため非表示',
    contentHiddenDesc:
      '10,000文字を超えているため表示を停止しています。保存またはコピーボタンを使用してください。',
    showAll: 'すべて表示 ({count} 文字)',
    inputPlaceholder: 'エンコードするテキストを入力...',
    base64Placeholder: 'デコードするBase64を入力...',
    tip: 'ヒント: 双方向変換に対応しています。左に入力するとエンコード、右に入力するとデコードされます。',
  },

  // === JSON-YAML Page ===
  jsonYaml: {
    importFile: 'インポート',
    formatJson: 'JSONを整形',
    jsonPlaceholder: 'JSONを入力...',
    yamlPlaceholder: 'YAMLを入力...',
    exportJson: 'JSONを保存',
    exportYaml: 'YAMLを保存',
    copyJson: 'JSONをコピー',
    copyYaml: 'YAMLをコピー',
    fileSizeLimit: '5MBを超えるファイルは選択できません',
    importSuccess: '読み込みました',
    exporting: '保存中...',
    formatSuccess: '整形しました',
    formatError: '不正なJSON形式です',
    tip: 'ヒント: リアルタイム変換とファイルの読み書きに対応しています。',
  },

  // === QR Code Page ===
  qrcode: {
    generateTab: 'QR生成',
    scanTab: 'QR読取',
    contentType: '内容タイプ',
    text: 'テキスト',
    link: 'URL',
    wifi: 'WiFi',
    mail: 'メール',
    inputContent: '入力内容',
    textPlaceholder: 'テキストを入力...',
    linkPlaceholder: 'URLを入力 (例: https://yule.ink)...',
    wifiSsid: 'ネットワーク名 (SSID)',
    wifiSsidPlaceholder: 'WIFI名',
    securityType: '暗号化',
    noPassword: 'なし',
    password: 'パスワードあり',
    wifiPasswordPlaceholder: 'パスワードを入力',
    hiddenNetwork: '非公開ネットワーク',
    recipient: '宛先',
    subjectOptional: '件名 (任意)',
    subjectPlaceholder: 'メールの件名',
    bodyLabel: '本文',
    bodyPlaceholder: 'メールの本文...',
    appearance: 'スタイル設定',
    errorLevel: '誤り訂正レベル',
    errorLevelDesc: 'L: 7%, M: 15%, Q: 25%, H: 30%。高レベルほど一部が隠れても読込可能です。',
    qrColor: 'QRの色',
    margin: '余白',
    size: 'サイズ',
    preview: 'プレビュー',
    waitInput: '入力を待機中...',
    saveQr: 'QRを保存',
    transparentWarning: '背景を透過させるとダークモードで読み取れない場合があります。',
    wifiWarning: '💡 WiFi QRコードはデバイスによって動作しない場合があります。',
    generateFailed: '生成に失敗しました',
    scanOrUpload: '画像を読み取り',
    dragOrClick: '画像をここにドラッグするか、ボタンで選択',
    selectImage: '画像を選択',
    imageSizeLimit: '10MBを超える画像は選択できません',
    scanSuccess: '解析に成功しました',
    noQrFound: 'QRコードが見つかりません',
    scanResult: '読み取り結果',
    copyContent: '内容をコピー',
    visitLink: 'リンクを開く',
    useCamera: 'カメラを使用',
    stopCamera: 'カメラを停止',
    cameraError: 'カメラにアクセスできません。権限を確認してください',
  },

  // === EXIF Page ===
  exif: {
    selectOrDrag: '画像を選択またはドラッグ',
    supportedFormats: 'JPG, PNG, HEICなどに対応。自動でEXIFを解析',
    selectImage: '画像を選択',
    parsing: 'EXIFを解析中...',
    selectFirst: '画像を選択してください',
    noExif: 'この画像にはEXIF情報が含まれていません',
    parseSuccess: '解析に成功しました',
    parseFailed: '解析に失敗しました。サポートされていない形式の可能性があります。',
    fileSizeLimit: '50MBを超えるファイルは選択できません',
    dragImageOnly: '画像ファイルのみ選択してください',
    copyJson: 'JSONをコピー',
    copiedJson: 'JSONとしてコピーしました',
    exportJson: 'JSONを保存',
    changeImage: '別の画像',
    replaceImage: '画像を入れ替え',
    heicNotSupported: '現在 HEIC 形式はサポートされていません',
    unknownDevice: '不明なデバイス',
    exifDetails: 'EXIF詳細データ',
    totalItems: '合計 {count} 項目',
    hideInvalid: '無効な情報を隠す',
    field: '項目',
    value: '値',
    action: '操作',
    copied: '{label} をコピーしました',
    copyItem: 'この項目をコピー',
    fields: {
      ImageWidth: '画像の幅',
      ImageHeight: '画像の高さ',
      Make: 'メーカー',
      Model: 'モデル',
      Orientation: '向き',
      XResolution: '水平解像度',
      YResolution: '垂直解像度',
      ResolutionUnit: '解像度単位',
      ModifyDate: '更新日時',
      YCbCrPositioning: 'YCbCr 位置',
      ExposureTime: '露出時間',
      FNumber: 'F値',
      ExposureProgram: '露出プログラム',
      ISO: 'ISO感度',
      ExifVersion: 'Exifバージョン',
      DateTimeOriginal: '撮影日時',
      CreateDate: 'デジタル化日時',
      OffsetTimeOriginal: 'タイムゾーンオフセット',
      ComponentsConfiguration: 'コンポーネント構成',
      ShutterSpeedValue: 'シャッタースピード',
      ApertureValue: '絞り値',
      BrightnessValue: '輝度',
      ExposureCompensation: '露出補正値',
      MaxApertureValue: '最大絞り値',
      MeteringMode: '測光方式',
      LightSource: '光源',
      Flash: 'フラッシュ',
      FocalLength: '焦点距離',
      SubSecTime: '秒未満（更新）',
      SubSecTimeOriginal: '秒未満（撮影）',
      SubSecTimeDigitized: '秒未満（デジタル化）',
      FlashpixVersion: 'Flashpixバージョン',
      ColorSpace: '色空間',
      ExifImageWidth: 'Exif画像の幅',
      ExifImageHeight: 'Exif画像の高さ',
      SensingMethod: 'センサー方式',
      SceneType: 'シーン',
      ExposureMode: '露出モード',
      WhiteBalance: 'ホワイトバランス',
      DigitalZoomRatio: 'デジタルズーム倍率',
      FocalLengthIn35mmFormat: '35mm換算焦点距離',
      SceneCaptureType: '撮影シーン',
      LensModel: 'レンズ',
      GPSLatitude: '緯度 (GPS)',
      GPSLongitude: '経度 (GPS)',
      GPSAltitudeRef: '高度基準',
      GPSAltitude: '高度',
      GPSTimeStamp: 'GPS時刻',
      GPSProcessingMethod: '測位方式',
      latitude: '解析された緯度',
      longitude: '解析された経度',
      InteropIndex: '互換ポインタ',
      InteropVersion: '互換バージョン',
      Software: 'ソフトウェア',
      ColorType: '色表現',
      BitDepth: 'ビット深度',
      ImageDescription: '画像の説明',
      Compression: '圧縮方式',
      Filter: 'フィルタ',
      Interlace: 'インタレース',
      ImageUniqueID: '固有ID',
    },
  },

  // === Reaction Test ===
  reaction: {
    waiting: {
      title: '反応速度テスト',
      subtitle: '画面が緑になったら素早くクリック！',
      hint: '画面をどこでもクリックして開始',
    },
    ready: {
      title: '緑になるまで待機...',
      subtitle: '集中してください',
    },
    now: {
      title: 'クリック！！！',
    },
    result: {
      title: 'あなたの成績',
      subtitle: 'クリックして再挑戦',
    },
    early: {
      title: '早すぎます！',
      subtitle: '緑になるまで待ってください',
      hint: 'クリックしてリスタート',
    },
    rank: {
      cheat: 'ツール使用ですか？？？',
      king: '🏆 神の反応',
      star: '⭐ 達人級',
      diamond: '💎 俊敏',
      gold: '🥇 平均以上',
      bronze: '🥉 一般人',
      afk: '💤 起きてますか？',
    },
  },

  // === Douyin Downloader ===
  dydown: {
    inputPlaceholder: 'Douyin の共有リンクを貼り付け...',
    parse: '解析',
    parsing: '解析中...',
    parseFailed: '解析に失敗しました',
    author: '作成者',
    downloadVideo: '動画を保存',
    downloadAudio: '音声を保存',
    disclaimer: '免責事項',
    disclaimerText:
      '本ツールは学習・研究目的のみに使用してください。著作権は各制作者に帰属します。',
    firstUseTitle: '使用案内',
    firstUseDesc:
      'Douyin のリンクから透かしなしの動画を抽出します。サーバー側ですべて処理されます。',
    agree: '同意して開始',
    disclaimerItem1: '商用目的での使用は禁止です',
    disclaimerItem2: '制作者の著作権を尊重してください',
    disclaimerItem3: 'すべてのコンテンツの権利は作成者に帰属します',
    disclaimerItem4: '本ツールの使用によるトラブルに責任は負いません',
  },

  // === Bilibili Downloader ===
  bilidown: {
    inputPlaceholder: 'Bilibili 動画URL または BV ID...',
    parseNow: '解析',
    parsing: '解析中...',
    parseFailed: '解析に失敗しました',
    advancedSettings: '詳細設定',
    cookiePlaceholder: 'Cookieを貼り付けてHD/4K解析を有効化...',
    cookieTip: 'Cookieを使用すると 1080P+ の画質が解放されます。一時的な使用のみで保存されません。',
    videoStream: '映像',
    audioStream: '音声',
    mergeDownload: '統合して保存',
    merging: '統合中...',
    mergeFailed: '統合に失敗しました',
    mergeSuccess: '完了しました',
    disclaimer: '免責事項',
    disclaimerText: '本ツールは学習・研究目的のみに使用してください。',
    firstUseTitle: '使用案内',
    firstUseDesc: 'ブラウザ内で FFmpeg WASM を使用して映像と音声を統合します。',
    agree: '同意して開始',
    disclaimerItem1: '商用目的での使用は禁止です',
    disclaimerItem2: '制作者の権利を尊重してください',
    disclaimerItem3: '権利は作成者および Bilibili に帰属します',
    disclaimerItem4: '自己責任で使用してください',
    disclaimerItem5: 'FFmpeg はブラウザ内で動作し、データがアップロードされることはありません',
    quality: '画質',
    codec: 'コーデック',
    selectVideo: '映像ストリーム選択',
    selectAudio: '音声ストリーム選択',
  },

  // === Weather ===
  weather: {
    searchPlaceholder: '都市名を検索...',
    searching: '検索中...',
    searchFailed: '検索に失敗しました',
    noResults: '見つかりませんでした',
    currentWeather: '現在の天気',
    hourlyForecast: '24時間予報',
    dailyForecast: '週間予報',
    temperature: '気温',
    humidity: '湿度',
    windSpeed: '風速',
    feelsLike: '体感温度',
    precipitation: '降水量',
    uvIndex: 'UV指数',
    sunrise: '日の出',
    sunset: '日没',
    searchTip:
      'Tip: ローカライズされていないインターフェースを使用しているため、中国の都市が検索できない場合は、ピンイン（例：北京の場合は beijing）を試してください。',
  },

  // === Honor of Kings ===
  hok: {
    hero: 'ヒーロー',
    item: '装備',
    skill: 'スキル',
    heroes: 'ヒーロー一覧',
    items: '装備一覧',
    summoner: '召喚師スキル',
    all: 'すべて',
    searchHero: 'ヒーロー名...',
    searchItem: '装備名...',
    searchSkill: 'スキル名...',
    searchSummoner: 'スキル名...',
    allRoles: '全ロール',
    warrior: '戦士',
    mage: '魔道士',
    tank: 'タンク',
    assassin: '刺客',
    marksman: '射手',
    support: '補助',
    attack: '物理攻撃',
    magic: '魔法攻撃',
    defense: '防御',
    movement: '機動力',
    jungle: 'ジャングル',
    roam: '遊撃',
    heroDetail: '詳細データ',
    skins: 'スキン',
    skills: 'スキル',
    cooldown: 'CD: ',
    manaCost: '消費',
    gold: '価格',
    unknown: '不明',
    loadFailed: '読み込みに失敗しました',
    resultCount: '{count} 件の結果',
  },

  // === 王者ボイス ===
  hokVoices: {
    selectHero: 'ヒーローを選択',
    selectSkin: 'スキンを選択',
    searchPlaceholder: 'テキストで絞り込み...',
    clearFilters: 'リセット',
    resultCount: '{count} 件のボイス',
    lines: '件',
    noResults: '該当するボイスがありません',
    loadFailed: 'データの読み込みに失敗しました',
    playFailed: '再生に失敗しました',
    selectHeroHint: 'ボイスを見るには、まずヒーローを選択してください',
    downloadFailed: 'ダウンロードに失敗しました。ネットワークを確認してください',
  },

  // === 古典詩 ===
  poetry: {
    searchPlaceholder: '詩のタイトルを検索 (例: 静夜思)...',
    resultCount: '{count} 件の結果が見つかりました',
    noResults: '関連する詩は見つかりませんでした',
    langOriginal: '原文',
    langSimp: '簡体字',
    langTrad: '繁体字',
  },

  // === Playground ===
  playground: {
    run: '実行',
    clear: 'クリア',
    console: 'コンソール',
    template: 'テンプレート',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
  },

  // === MCPE ===
  mcpe: {
    hideBeta: 'ベータ版を隠す',
    searchPlaceholder: 'バージョン検索...',
    loadFailed: '読み込み失敗',
    noResults: '見つかりませんでした',
    resultCount: '全 {count} バージョン',
    beta: 'ベータ版',
    release: '正式版',
    downloadTitle: 'ダウンロード',
    archSelector: 'アーキテクチャ',
    v8a: '64bit (v8a)',
    v7a: '32bit (v7a)',
    downloadingInfo: 'リンクを取得中...',
    fetchFailed: '取得に失敗しました',
    downloadWay: '取得方法',
    password: 'パス',
    copyPassword: 'パスをコピーして開く',
    openLink: '保存先を開く',
    viewMode: '表示モード',
    groupView: 'カテゴリ別',
    timelineView: '年表',
  },

  // === Translator AI ===
  translatorAi: {
    source: '原文',
    target: '翻訳結果',
    sourcePlaceholder: '翻訳する内容を入力...',
    targetPlaceholder: '結果がここに表示されます...',
    detecting: '言語を判定中...',
    detected: '判定: {lang}',
    detectFailed: '判定に失敗',
    translating: '翻訳中...',
    translate: '翻訳',
    notSupportedTitle: 'サポート外',
    notSupportedDesc: 'Chrome 131+ の AI 翻訳機能を有効にする必要があります。',
    howToEnable: '有効にするには？',
    modelDownloading: 'AIモデルをダウンロード中... {progress}%',
    modelReady: '準備完了',
    notAvailable: '非対応',
    apiError: '翻訳エラー',
    languages: {
      auto: '自動検出',
      zh: '中国語（簡体字）',
      'zh-Hant': '中国語（繁体字）',
      en: '英語',
      ja: '日本語',
      fr: 'フランス語',
      ru: 'ロシア語',
      es: 'スペイン語',
    },
  },

  // === Code to Image ===
  codeimg: {
    exporting: '画像を生成中...',
    copySuccess: 'コピーしました',
    copyFailed: 'コピー失敗',
    language: '言語',
    theme: 'テーマ',
    background: '背景',
    minWidth: '最小幅',
    showFileName: 'ファイル名を表示',
    fileNamePlaceholder: 'ファイル名',
    windowControls: 'ウィンドウ釦',
    lineNumbers: '行番号',
    shadow: 'シャドウ',
    solidColor: '単色',
    gradientColor: 'グラデーション',
    transparent: '透過',
    resetDefaults: 'デフォルトに戻す',
    importCode: 'ファイル読込',
    copyImage: '画像をコピー',
    downloadImage: 'PNGで保存',
    themes: {
      tomorrow: 'Tomorrow Night',
      okaidia: 'Okaidia',
      coy: 'Coy',
      solarizedLight: 'Solarized Light',
      twilight: 'Twilight',
      dark: 'Dark',
    },
  },

  // === Speak Nicely ===
  hhsh: {
    inputPlaceholder: '略語（複数はスペース区切り）を入力...',
    query: '検索',
    querying: '検索中...',
    noResults: '見つかりませんでした',
    inputtingLabel: '候補',
    submitNew: '新語を投稿',
    submitPlaceholder: '意味を入力してください',
    submitPrefix: '意味:',
    submit: '投稿',
    submitting: '送信中...',
    submitSuccess: '投稿ありがとうございます！審査に入ります。',
    submitError: '送信失敗',
    nameLabel: '略語',
  },

  // === Exchange Rates ===
  exchange: {
    baseAmount: '金額',
    baseCurrency: '基準通貨',
    targetCurrency: '変換通貨',
    convertedAmount: '変換後',
    historicalDate: '日付',
    latestRates: 'リアルタイムレート',
    swap: '入れ替え',
    selectDate: '日付選択',
    allRates: 'その他のレート',
    unit: '単位:',
    searchCurrency: '通貨を検索...',
    fetchFailed: '取得に失敗しました',
    trendTitle: 'レート推移グラフ',
    last30DaysTrend: '最近 90 日間の推移',
    currencies: {
      AUD: 'オーストラリア・ドル',
      BGN: 'ブルガリア・レフ',
      BRL: 'ブラジル・レアル',
      CAD: 'カナダ・ドル',
      CHF: 'スイス・フラン',
      CNY: '人民元',
      CZK: 'チェコ・コルナ',
      DKK: 'デンマーク・クローネ',
      EUR: 'ユーロ',
      GBP: '英国ポンド',
      HKD: '香港ドル',
      HUF: 'ハンガリー・フォリント',
      IDR: 'インドネシア・ルピア',
      ILS: 'イスラエル・シュケル',
      INR: 'インド・ルピー',
      ISK: 'アイスランド・クローナ',
      JPY: '日本円',
      KRW: '韓国ウォン',
      MXN: 'メキシコ・ペソ',
      MYR: 'マレーシア・リンギット',
      NOK: 'ノルウェー・クローネ',
      NZD: 'ニュージーランド・ドル',
      PHP: 'フィリピン・ペソ',
      PLN: 'ポーランド・ズロチ',
      RON: 'ルーマニア・レイ',
      SEK: 'スウェーデン・クローナ',
      SGD: 'シンガポール・ドル',
      THB: 'タイ・バーツ',
      TRY: 'トルコ・リラ',
      USD: '米国ドル',
      ZAR: '南アフリカ・ランド',
    },
  },

  // === Phone Locator ===
  phoneNumber: {
    inputPlaceholder: '電話番号を入力...',
    query: '検索',
    province: '省',
    city: '市',
    isp: 'キャリア',
    notFound: '情報が見つかりませんでした',
    queryFailed: '検索失敗',
    checkInput: '正しい電話番号（11桁）を入力してください',
    history: '履歴',
    loadingDb: 'データベース読込中...',
    dbLoadFailed: '読込に失敗しました。再読み込みしてください。',
  },

  // === BV/AV ===
  bvav: {
    inputPlaceholder: 'BV ID または AV ID...',
    convert: '変換',
    clear: 'クリア',
    resultBv: 'BV ID',
    resultAv: 'AV ID',
    copied: 'コピーしました',
    invalidInput: '不正な入力です',
    invalidBv: 'BV ID の形式が正しくありません',
    invalidAv: 'AV ID の形式が正しくありません',
    history: '変換履歴',
    tip: 'ヒント: BV ID を入れると AV ID に、AV ID を入れると BV ID に変換されます。オフラインで処理されます。',
  },

  // === Length Converter ===
  length: {
    baseAmount: '入力値',
    baseUnit: '基準単位',
    targetUnit: '変換後単位',
    convertedAmount: '結果',
    allRates: '単位換算一覧',
    searchUnit: '単位を検索...',
    unit: '単位:',
    swap: '入れ替え',
    scientific: '科学記数法',
    types: {
      metric: 'メートル法',
      imperial: 'ヤード・ポンド法',
      traditional: '伝統的（市制）',
    },
    units: {
      metric: {
        dm: 'デシメートル',
        ly: '光年',
        mm: 'ミリメートル',
        km: 'キロメートル',
        cm: 'センチメートル',
        m: 'メートル',
        μm: 'マイクロメートル',
        pc: 'パーセク',
        AU: '天文単位',
        ld: '月距離',
        pm: 'ピコメートル',
        nm: 'ナノメートル',
      },
      imperial: {
        fur: 'ハロン',
        fm: 'ファゾム',
        yd: 'ヤード',
        nmi: '海里',
        ft: 'フィート',
        mi: 'マイル',
        in: 'インチ',
      },
      traditional: {
        zhang: '丈 (Zhang)',
        fen: '分 (Fen)',
        hao: '毫 (Hao)',
        chi: '尺 (Chi)',
        li: '里 (Li)',
      },
    },
  },

  // === Weibo Hot Search ===
  'weibo-hot': {
    dateSelect: '日付を選択',
    historical: '過去のランキング',
    displayCount: '表示数',
    show50: 'TOP 50',
    show100: 'TOP 100',
    show150: 'TOP 150',
    showAll: 'すべて',
    loading: 'データ取得中...',
    fetchFailed: '取得に失敗したか、データがありません',
    noResults: 'この日付のデータは記録されていません',
    rank: '万',
  },

  lyric: {
    searchPlaceholder: '曲名または歌手名で検索...',
    searching: '検索中...',
    searchFailed: '検索に失敗しました',
    noResults: '検索結果がありません',
    results: '検索結果',
    loading: '読み込み中...',
    loadFailed: '歌詞の読み込みに失敗しました',
    noLyric: '歌詞がありません',
    downloadLrc: 'LRCダウンロード',
    copyLyric: '歌詞をコピー',
    timeline: 'タイムライン',
    lyricMode: 'テキストのみ',
    singer: '歌手',
    album: 'アルバム',
    duration: '時間',
    lyricLine: '行',
  },

  // === 網易雲プレイリスト ===
  'ncm-get-playlist': {
    inputPlaceholder: 'リンクまたはIDを入力...',
    parse: '取得',
    parsing: '取得中...',
    parseFailed: '取得に失敗しました。公開プレイリストであるか確認してください。',
    copySongs: '曲リストをコピー',
    copyConfirm: '曲数が多いため、コピーすると動作が重くなる可能性があります。そのままコピーしますか？',
    exportTxt: 'TXT をエクスポート',
    exportCsv: 'CSV をエクスポート',
    exportJson: 'JSON をエクスポート',
    fetchRange: '取得範囲',
    rangeHelp: '取得する楽曲の開始位置と終了位置を設定します。例：0 - 200 は1曲目から200曲目までを取得、100 - 300 は最初の100曲をスキップして次の200曲を取得します。',
    chunkSize: '1回の取得数',
    chunkHelp: 'ネットワークやAPIの制限を回避するため、データを分割して取得します。通常は 50-100 を推奨します。',
    errChunkSizeGTLimit: '1回の取得数は取得総数を超えることはできません',
    errChunkSizeGT200: '1回の取得数は200を超えることはできません',
    errLimitGT3000: '動作を軽くするため、取得数は最大3000に制限されています',
    errOffsetGTLimit: 'スキップ件数は取得総数を超えることはできません',
    songCount: '全 {count} 曲',
    idExtracted: '解析されたID: {id}',
    songName: '曲名',
    artist: 'アーティスト',
    album: 'アルバム',
    noData: 'データがないか、非公開です',
    creator: '作成者',
    playCount: '再生数: {count}万',
    trackCount: '曲数: {count}',
    tags: 'タグ',
    description: '説明',
  },
}
