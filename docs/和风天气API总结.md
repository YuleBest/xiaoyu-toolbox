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

```

```
