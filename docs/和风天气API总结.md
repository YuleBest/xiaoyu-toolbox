# 和风天气 API 总结

## 调用方法

> 以 `curl` 为例

```bash
curl 'https://[YOUR_API_HOST]/[API_PATH]?[PARAM_1]&[PARAM_2]&...&key=[YOUR_API_KEY]'
```

## GeoAPI

### 城市搜索

城市搜索API提供全球地理位位置、全球城市搜索服务，支持经纬度坐标反查、多语言、模糊搜索等功能。

天气数据是基于地理位置的数据，因此获取天气之前需要先知道具体的位置信息。使用城市搜索，可获取到该城市的基本信息，包括城市的Location ID（你需要这个ID去查询天气），多语言名称、经纬度、时区、海拔、Rank值、归属上级行政区域、所在行政区域等。

另外，城市搜索也可以帮助你在你的APP中实现模糊搜索，用户只需要输入1-2个字即可获得结果。

#### 请求路径

`/geo/v2/city/lookup`

#### 查询参数

- `location`_(必选)_: 需要查询地区的名称，支持文字、以英文逗号分隔的经度纬度坐标（十进制，最多支持小数点后两位）、LocationID 或 Adcode（仅限中国城市）。例如 `location=北京` 或 `location=116.41,39.92`.

- `range`: 搜索范围，可设定只在某个国家或地区范围内进行搜索，国家和地区名称需使用 ISO 3166 所定义的国家代码。如果不设置此参数，搜索范围将在所有城市。例如 `range=cn`.

- `number`: 返回结果的数量，取值范围 `1`-`20`，默认返回 10 个结果。

- `lang`: 多语言设置。

#### 备注

- 模糊搜索，当 `location` 传递的为文字时，支持模糊搜索，即用户可以只输入城市名称一部分进行搜索，最少 1 个汉字或 2 个字符，结果将按照相关性和 Rank 值进行排列，便于开发或用户进行选择他们需要查看哪个城市的天气。例如 `location=bei`，将返回与"bei"相关性最强的若干结果，包括黎巴嫩的贝鲁特和中国的北京市。

- 重名，当 `location` 传递的为文字时，可能会出现重名的城市，例如陕西省西安市、吉林省辽源市下辖的西安区和黑龙江省牡丹江市下辖的西安区，此时会根据 Rank 值排序返回所有结果。在这种情况下，可以通过 `adm` 参数的方式进一步确定需要查询的城市或地区，例如 `location=西安&adm=黑龙江`。
  - `adm` 城市的上级行政区划，可设定只在某个行政区划范围内进行搜索，用于排除重名城市或对结果进行过滤。例如 `adm=beijing`.
  - 如请求参数为 `location=chaoyang&adm=beijing` 时，返回的结果只包括北京市的朝阳区，而不包括辽宁省的朝阳市。
  - 如请求参数仅为 `location=chaoyang` 时，返回的结果包括北京市的朝阳区、辽宁省的朝阳市以及长春市的朝阳区。

#### 返回数据

返回数据是 JSON 格式并进行了 Gzip 压缩。

```json
{
  "code": "200",
  "location": [
    {
      "name": "北京",
      "id": "101010100",
      "lat": "39.90499",
      "lon": "116.40529",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "10",
      "fxLink": "https://www.qweather.com/weather/beijing-101010100.html"
    },
    {
      "name": "海淀",
      "id": "101010200",
      "lat": "39.95607",
      "lon": "116.31032",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "15",
      "fxLink": "https://www.qweather.com/weather/haidian-101010200.html"
    },
    {
      "name": "朝阳",
      "id": "101010300",
      "lat": "39.92149",
      "lon": "116.48641",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "15",
      "fxLink": "https://www.qweather.com/weather/chaoyang-101010300.html"
    },
    {
      "name": "昌平",
      "id": "101010700",
      "lat": "40.21809",
      "lon": "116.23591",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "23",
      "fxLink": "https://www.qweather.com/weather/changping-101010700.html"
    },
    {
      "name": "房山",
      "id": "101011200",
      "lat": "39.73554",
      "lon": "116.13916",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "23",
      "fxLink": "https://www.qweather.com/weather/fangshan-101011200.html"
    },
    {
      "name": "通州",
      "id": "101010600",
      "lat": "39.90249",
      "lon": "116.65860",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "23",
      "fxLink": "https://www.qweather.com/weather/tongzhou-101010600.html"
    },
    {
      "name": "丰台",
      "id": "101010900",
      "lat": "39.86364",
      "lon": "116.28696",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "25",
      "fxLink": "https://www.qweather.com/weather/fengtai-101010900.html"
    },
    {
      "name": "大兴",
      "id": "101011100",
      "lat": "39.72891",
      "lon": "116.33804",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "25",
      "fxLink": "https://www.qweather.com/weather/daxing-101011100.html"
    },
    {
      "name": "延庆",
      "id": "101010800",
      "lat": "40.46532",
      "lon": "115.98501",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "33",
      "fxLink": "https://www.qweather.com/weather/yanqing-101010800.html"
    },
    {
      "name": "平谷",
      "id": "101011500",
      "lat": "40.14478",
      "lon": "117.11234",
      "adm2": "北京",
      "adm1": "北京市",
      "country": "中国",
      "tz": "Asia/Shanghai",
      "utcOffset": "+08:00",
      "isDst": "0",
      "type": "city",
      "rank": "33",
      "fxLink": "https://www.qweather.com/weather/pinggu-101011500.html"
    }
  ],
  "refer": {
    "sources": ["QWeather"],
    "license": ["QWeather Developers License"]
  }
}
```

- `location.name`: 地区/城市名称
- `location.id`: 地区/城市 ID
- `location.lat`: 地区/城市纬度
- `location.lon`: 地区/城市经度
- `location.adm2`: 地区/城市的上级行政区划名称
- `location.adm1`: 地区/城市所属一级行政区域
- `location.country`: 地区/城市所属国家名称
- `location.tz`: 地区/城市所在时区
- `location.utcOffset`: 地区/城市目前与 UTC 时间偏移的小时数，参考详细说明
- `location.isDst`: 地区/城市是否当前处于夏令时。1 表示当前处于夏令时，0 表示当前不是夏令时。
- `location.type`: 地区/城市的属性
- `location.rank`: 地区评分
- `location.fxLink`: 该地区的天气预报网页链接，便于嵌入你的网站或应用
- `refer.sources`: 原始数据来源，或数据源说明，可能为空
- `refer.license`: 数据许可或版权声明，可能为空

## 天气预报

天气 API 提供全球 20 多万个城市的实时天气和预报数据，并支持基于数值模式的天气预报，分辨率达 3–5 公里，覆盖全球坐标点。

### 实时天气

获取中国 3000+ 市县区和海外 20 万个城市**实时**天气数据，包括实时温度、体感温度、风力风向、相对湿度、大气压强、降水量、能见度、露点温度、云量等。

#### 请求路径

`GET /v7/weather/now`

#### 查询参数

- `location`_(必选)_: 需要查询地区的 LocationID 或以英文逗号分隔的经度,纬度坐标（十进制，最多支持小数点后两位），LocationID可通过 GeoAPI 获取。例如 `location=101010100` 或 `location=116.41,39.92`

- `lang`: 多语言设置，请阅读多语言文档，了解我们的多语言是如何工作、如何设置以及数据是否支持多语言。

- `unit`: 数据单位设置，可选值包括 `unit=m`（公制单位，默认）和 `unit=i`（英制单位）。更多选项和说明参考度量衡单位。

#### 请求示例

```bash
curl 'https://[YOUR_API_HOST]/v7/weather/now?location=101010100&key=[YOUR_API_KEY]'
```

#### 返回数据

返回数据是 JSON 格式并进行了 Gzip 压缩。

```json
{
  "code": "200",
  "updateTime": "2020-06-30T22:00+08:00",
  "fxLink": "http://hfx.link/2ax1",
  "now": {
    "obsTime": "2020-06-30T21:40+08:00",
    "temp": "24",
    "feelsLike": "26",
    "icon": "101",
    "text": "多云",
    "wind360": "123",
    "windDir": "东南风",
    "windScale": "1",
    "windSpeed": "3",
    "humidity": "72",
    "precip": "0.0",
    "pressure": "1003",
    "vis": "16",
    "cloud": "10",
    "dew": "21"
  },
  "refer": {
    "sources": ["QWeather", "NMC", "ECMWF"],
    "license": ["QWeather Developers License"]
  }
}
```

#### 字段说明

- `code`: 请参考状态码
- `updateTime`: 当前 API 的最近更新时间
- `fxLink`: 当前数据的响应式页面，便于嵌入网站或应用
- `now.obsTime`: 数据观测时间
- `now.temp`: 温度，默认单位：摄氏度
- `now.feelsLike`: 体感温度，默认单位：摄氏度
- `now.icon`: 天气状况的图标代码，另请参考天气图标项目
- `now.text`: 天气状况的文字描述，包括阴晴雨雪等天气状态的描述
- `now.wind360`: 风向 360 角度
- `now.windDir`: 风向
- `now.windScale`: 风力等级
- `now.windSpeed`: 风速，公里/小时
- `now.humidity`: 相对湿度，百分比数值
- `now.precip`: 过去 1 小时降水量，默认单位：毫米
- `now.pressure`: 大气压强，默认单位：百帕
- `now.vis`: 能见度，默认单位：公里
- `now.cloud`: 云量，百分比数值。**可能为空**
- `now.dew`: 露点温度。**可能为空**
- `refer.sources`: 原始数据来源，或数据源说明，**可能为空**
- `refer.license`: 数据许可或版权声明，**可能为空**

### 每日天气预报

每日天气预报 API，提供全球城市未来 3-30 天天气预报，包括：日出日落、月升月落、最高最低温度、天气白天和夜间状况、风力、风速、风向、相对湿度、大气压强、降水量、露点温度、紫外线强度、能见度等。

#### 请求路径

`GET /v7/weather/{days}`

#### 路径参数

- `days`_(必选)_: 预报天数，支持最多 30 天预报，可选值：
  - `3d`: 3 天预报
  - `7d`: 7 天预报
  - `10d`: 10 天预报
  - `15d`: 15 天预报
  - `30d`: 30 天预报

#### 查询参数

- `location`_(必选)_: 需要查询地区的 LocationID 或以英文逗号分隔的经度,纬度坐标（十进制，最多支持小数点后两位），LocationID可通过 GeoAPI 获取。例如 `location=101010100` 或 `location=116.41,39.92`

- `lang`: 多语言设置，请阅读多语言文档，了解我们的多语言是如何工作、如何设置以及数据是否支持多语言。

- `unit`: 数据单位设置，可选值包括 `unit=m`（公制单位，默认）和 `unit=i`（英制单位）。更多选项和说明参考度量衡单位。

#### 请求示例

```bash
curl 'https://[YOUR_API_HOST]/v7/weather/3d?location=101010100&key=[YOUR_API_KEY]'
```

#### 返回数据

返回数据是 JSON 格式并进行了 Gzip 压缩。

```json
{
  "code": "200",
  "updateTime": "2021-11-15T16:35+08:00",
  "fxLink": "http://hfx.link/2ax1",
  "daily": [
    {
      "fxDate": "2021-11-15",
      "sunrise": "06:58",
      "sunset": "16:59",
      "moonrise": "15:16",
      "moonset": "03:40",
      "moonPhase": "盈凸月",
      "moonPhaseIcon": "803",
      "tempMax": "12",
      "tempMin": "-1",
      "iconDay": "101",
      "textDay": "多云",
      "iconNight": "150",
      "textNight": "晴",
      "wind360Day": "45",
      "windDirDay": "东北风",
      "windScaleDay": "1-2",
      "windSpeedDay": "3",
      "wind360Night": "0",
      "windDirNight": "北风",
      "windScaleNight": "1-2",
      "windSpeedNight": "3",
      "humidity": "65",
      "precip": "0.0",
      "pressure": "1020",
      "vis": "25",
      "cloud": "4",
      "uvIndex": "3"
    },
    {
      "fxDate": "2021-11-16",
      "sunrise": "07:00",
      "sunset": "16:58",
      "moonrise": "15:38",
      "moonset": "04:40",
      "moonPhase": "盈凸月",
      "moonPhaseIcon": "803",
      "tempMax": "13",
      "tempMin": "0",
      "iconDay": "100",
      "textDay": "晴",
      "iconNight": "101",
      "textNight": "多云",
      "wind360Day": "225",
      "windDirDay": "西南风",
      "windScaleDay": "1-2",
      "windSpeedDay": "3",
      "wind360Night": "225",
      "windDirNight": "西南风",
      "windScaleNight": "1-2",
      "windSpeedNight": "3",
      "humidity": "74",
      "precip": "0.0",
      "pressure": "1016",
      "vis": "25",
      "cloud": "1",
      "uvIndex": "3"
    }
  ],
  "refer": {
    "sources": ["QWeather", "NMC", "ECMWF"],
    "license": ["QWeather Developers License"]
  }
}
```

#### 字段说明

- `code`: 请参考状态码
- `updateTime`: 当前 API 的最近更新时间
- `fxLink`: 当前数据的响应式页面，便于嵌入网站或应用
- `daily.fxDate`: 预报日期
- `daily.sunrise`: 日出时间，**在高纬度地区可能为空**
- `daily.sunset`: 日落时间，**在高纬度地区可能为空**
- `daily.moonrise`: 当天月升时间，**可能为空**
- `daily.moonset`: 当天月落时间，**可能为空**
- `daily.moonPhase`: 月相名称
- `daily.moonPhaseIcon`: 月相图标代码，另请参考天气图标项目
- `daily.tempMax`: 预报当天最高温度
- `daily.tempMin`: 预报当天最低温度
- `daily.iconDay`: 预报白天天气状况的图标代码，另请参考天气图标项目
- `daily.textDay`: 预报白天天气状况文字描述，包括阴晴雨雪等天气状态的描述
- `daily.iconNight`: 预报夜间天气状况的图标代码，另请参考天气图标项目
- `daily.textNight`: 预报晚间天气状况文字描述，包括阴晴雨雪等天气状态的描述
- `daily.wind360Day`: 预报白天风向 360 角度
- `daily.windDirDay`: 预报白天风向
- `daily.windScaleDay`: 预报白天风力等级
- `daily.windSpeedDay`: 预报白天风速，公里/小时
- `daily.wind360Night`: 预报夜间风向 360 角度
- `daily.windDirNight`: 预报夜间当天风向
- `daily.windScaleNight`: 预报夜间风力等级
- `daily.windSpeedNight`: 预报夜间风速，公里/小时
- `daily.precip`: 预报当天总降水量，默认单位：毫米
- `daily.uvIndex`: 紫外线强度指数
- `daily.humidity`: 相对湿度，百分比数值
- `daily.pressure`: 大气压强，默认单位：百帕
- `daily.vis`: 能见度，默认单位：公里
- `daily.cloud`: 云量，百分比数值。**可能为空**
- `refer.sources`: 原始数据来源，或数据源说明，**可能为空**
- `refer.license`: 数据许可或版权声明，**可能为空**

### 逐小时天气预报

逐小时天气预报 API，提供全球城市未来 24-168 小时逐小时天气预报，包括：温度、天气状况、风力、风速、风向、相对湿度、大气压强、降水概率、露点温度、云量。

#### 请求路径

`GET /v7/weather/{hours}`

#### 路径参数

- `hours`_(必选)_: 预报小时数，支持最多 168 小时预报，可选值：
  - `24h`: 24 小时预报
  - `72h`: 72 小时预报
  - `168h`: 168 小时预报

#### 查询参数

- `location`_(必选)_: 需要查询地区的 LocationID 或以英文逗号分隔的经度,纬度坐标（十进制，最多支持小数点后两位），LocationID可通过 GeoAPI 获取。例如 `location=101010100` 或 `location=116.41,39.92`

- `lang`: 多语言设置，请阅读多语言文档，了解我们的多语言是如何工作、如何设置以及数据是否支持多语言。

- `unit`: 数据单位设置，可选值包括 `unit=m`（公制单位，默认）和 `unit=i`（英制单位）。更多选项和说明参考度量衡单位。

#### 请求示例

```bash
curl 'https://[YOUR_API_HOST]/v7/weather/24h?location=101010100&key=[YOUR_API_KEY]'
```

#### 返回数据

返回数据是 JSON 格式并进行了 Gzip 压缩。

```json
{
  "code": "200",
  "updateTime": "2021-02-16T13:35+08:00",
  "fxLink": "http://hfx.link/2ax1",
  "hourly": [
    {
      "fxTime": "2021-02-16T15:00+08:00",
      "temp": "2",
      "icon": "100",
      "text": "晴",
      "wind360": "335",
      "windDir": "西北风",
      "windScale": "3-4",
      "windSpeed": "20",
      "humidity": "11",
      "pop": "0",
      "precip": "0.0",
      "pressure": "1025",
      "cloud": "0",
      "dew": "-25"
    },
    {
      "fxTime": "2021-02-16T16:00+08:00",
      "temp": "1",
      "icon": "100",
      "text": "晴",
      "wind360": "339",
      "windDir": "西北风",
      "windScale": "3-4",
      "windSpeed": "24",
      "humidity": "11",
      "pop": "0",
      "precip": "0.0",
      "pressure": "1025",
      "cloud": "0",
      "dew": "-26"
    }
  ],
  "refer": {
    "sources": ["QWeather", "NMC", "ECMWF"],
    "license": ["QWeather Developers License"]
  }
}
```

#### 字段说明

- `code`: 请参考状态码
- `updateTime`: 当前 API 的最近更新时间
- `fxLink`: 当前数据的响应式页面，便于嵌入网站或应用
- `hourly.fxTime`: 预报时间
- `hourly.temp`: 温度，默认单位：摄氏度
- `hourly.icon`: 天气状况的图标代码，另请参考天气图标项目
- `hourly.text`: 天气状况的文字描述，包括阴晴雨雪等天气状态的描述
- `hourly.wind360`: 风向 360 角度
- `hourly.windDir`: 风向
- `hourly.windScale`: 风力等级
- `hourly.windSpeed`: 风速，公里/小时
- `hourly.humidity`: 相对湿度，百分比数值
- `hourly.precip`: 当前小时累计降水量，默认单位：毫米
- `hourly.pop`: 逐小时预报降水概率，百分比数值，**可能为空**
- `hourly.pressure`: 大气压强，默认单位：百帕
- `hourly.cloud`: 云量，百分比数值。**可能为空**
- `hourly.dew`: 露点温度。**可能为空**
- `refer.sources`: 原始数据来源，或数据源说明，**可能为空**
- `refer.license`: 数据许可或版权声明，**可能为空**
