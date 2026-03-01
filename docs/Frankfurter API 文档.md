# Frankfurter API 文档

Frankfurter 是一个免费、开源的货币数据 API，追踪由欧洲中央银行等机构和非商业来源发布的参考汇率。

无需使用次数限制及 API 密钥。非常适合在浏览器或移动应用的客户端使用。主 API 服务位于 `api.frankfurter.dev`。如果需要，你也可以选择自托管。

---

## 使用方法 (Usage)

Frankfurter 提供用于获取最新汇率、历史数据或时间序列数据的端点。

### 最新汇率 (Latest Rates)

获取最新工作日的汇率，每日于欧洲中部时间 (CET) 16:00 左右更新。

```bash
curl -s https://api.frankfurter.dev/v1/latest
```

**响应示例：**

```json
{
  "base": "EUR",
  "date": "2026-02-23",
  "rates": {
    "AUD": 1.6669,
    "BRL": 6.1059,
    "CAD": 1.6132,
    "CHF": 0.9145,
    "...": "..."
  }
}
```

使用 `base` 参数更改基准货币（默认为 `EUR`）。

```bash
curl -s https://api.frankfurter.dev/v1/latest?base=USD
```

使用 `symbols` 参数限制响应中的目标货币。

```bash
curl -s https://api.frankfurter.dev/v1/latest?symbols=CHF,GBP
```

### 历史汇率 (Historical Rates)

获取特定日期的汇率。

```bash
curl -s https://api.frankfurter.dev/v1/1999-01-04
```

**响应示例：**

```json
{
  "base": "EUR",
  "date": "1999-01-04",
  "rates": {
    "AUD": 1.91,
    "CAD": 1.8004,
    "CHF": 1.6168,
    "CYP": 0.58231,
    "...": "..."
  }
}
```

可以配合使用基准货币和目标货币过滤：

```bash
curl -s https://api.frankfurter.dev/v1/1999-01-04?base=USD&symbols=EUR
```

> **注意：** Frankfurter 使用 UTC 存储日期。如果你处于不同的时区，请注意查询日期可能与预期不同。此外，当天返回的数据不稳定，如果发布了新利率，数据将会更新。

### 时间序列数据 (Time Series Data)

获取一段时间内的汇率。

```bash
curl -s https://api.frankfurter.dev/v1/2000-01-01..2000-12-31
```

**响应示例：**

```json
{
  "base": "EUR",
  "start_date": "1999-12-30",
  "end_date": "2000-12-29",
  "rates": {
    "1999-12-30": { "AUD": 1.5422, "...": "..." },
    "2000-01-03": { "AUD": 1.5346, "...": "..." },
    "...": "..."
  }
}
```

获取从某一日期到目前的汇率：

```bash
curl -s https://api.frankfurter.dev/v1/2024-01-01..
```

**提示：** 过滤货币符号以减小响应体积并提升性能。

```bash
curl -s https://api.frankfurter.dev/v1/2024-01-01..?symbols=USD
```

### 可用货币 (Available Currencies)

获取受支持的货币符号及其全称。

```bash
curl -s https://api.frankfurter.dev/v1/currencies
```

---

## 货币转换 (Currency Conversion)

可以通过获取汇率并在代码中进行计算来实现货币转换：

```javascript
function convert(from, to, amount) {
  fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`)
    .then((resp) => resp.json())
    .then((data) => {
      const convertedAmount = (amount * data.rates[to]).toFixed(2);
      console.log(`${amount} ${from} = ${convertedAmount} ${to}`);
    });
}

convert("EUR", "USD", 10);
```

---

## 部署 (Deployment)

如果你不想使用托管服务，可以使用 Docker 自行托管：

```bash
# 在 80 端口运行 Frankfurter
docker run -d -p 80:8080 lineofflight/frankfurter
```
