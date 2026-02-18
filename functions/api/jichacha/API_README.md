# 机查查 API 文档

该文档描述了 `/api/jichacha` 下的 API 接口。

## 基础 URL

API 的基础路径为 `/api/jichacha`。

## 接口列表

### 1. 获取品牌列表 (Detail)

获取数据库中所有去重后的品牌列表，按数量降序排列。支持分页。

- **URL**: `/detail`
- **方法**: `GET`
- **描述**: 返回包含品牌名称、品牌标题及该品牌下机型数量的列表。

**请求参数**:

| 参数名  | 类型   | 必填 | 默认值 | 描述     |
| :------ | :----- | :--- | :----- | :------- |
| `page`  | number | 否   | 1      | 页码     |
| `limit` | number | 否   | 100    | 每页数量 |

**响应示例**:

```json
{
  "success": true,
  "page": 1,
  "limit": 100,
  "total": 50,
  "results": [
    {
      "brand": "apple",
      "brand_title": "苹果",
      "count": 50
    }
    // ...
  ]
}
```

**缓存策略**:

- `Cache-Control: public, max-age=3600` (缓存 1 小时)

---

### 2. 获取设备类型 (Dtypes)

获取数据库中所有设备类型及其数量。

- **URL**: `/dtypes`
- **方法**: `GET`
- **描述**: 返回设备类型列表，用于筛选。

**请求参数**:

无。

**响应示例**:

```json
{
  "success": true,
  "results": [
    {
      "dtype": "phone",
      "count": 1000
    },
    {
      "dtype": "pad",
      "count": 200
    }
  ]
}
```

**缓存策略**:

- `Cache-Control: public, max-age=86400` (缓存 1 天)

---

### 3. 搜索机型 (Search)

搜索手机机型数据，支持多关键词、智能回退和字段精确/模糊过滤。

- **URL**: `/search`
- **方法**: `GET`
- **描述**: 根据关键词或特定字段筛选机型数据。

**请求参数 (Query Params)**:

| 参数名       | 类型   | 必填 | 默认值 | 描述                                                                                                           |
| :----------- | :----- | :--- | :----- | :------------------------------------------------------------------------------------------------------------- |
| `q`          | string | 否   | -      | 通用搜索关键词。支持多关键词（空格分隔），同时匹配 `model`, `code`, `code_alias`, `model_name`, `brand` 字段。 |
| `page`       | number | 否   | 1      | 页码。                                                                                                         |
| `limit`      | number | 否   | 100    | 返回结果的最大数量。                                                                                           |
| `dtype`      | string | 否   | -      | 设备类型筛选。                                                                                                 |
| `model`      | string | 否   | -      | 机型型号 (精确匹配)。                                                                                          |
| `brand`      | string | 否   | -      | 品牌代码 (模糊匹配)。                                                                                          |
| `code`       | string | 否   | -      | 内部代号 (精确匹配)。                                                                                          |
| `code_alias` | string | 否   | -      | 代号别名 (模糊匹配)。                                                                                          |
| `model_name` | string | 否   | -      | 机型名称 (模糊匹配)。                                                                                          |
| `ver_name`   | string | 否   | -      | 版本名称 (模糊匹配)。                                                                                          |

**主要逻辑**:

1.  **多关键词**: `q` 参数支持空格分隔，如 "xiaomi 17"，逻辑为 `AND`，即所有关键词都必须匹配（但每个关键词可匹配任意字段）。
2.  **智能回退 (Smart Fallback)**: 如果搜索无结果：
    - **策略 1**: 尝试将中文品牌名转换为英文代码（如 "小米" -> "xiaomi"）重试。
    - **策略 2**: 如果仍无结果，尝试仅搜索品牌词（如 "Xiaomi 17" -> "Xiaomi"）。
3.  **结果聚合**: 响应中会返回当前搜索结果对应各 `dtype` 的数量统计。

**响应示例**:

```json
{
  "success": true,
  "page": 1,
  "limit": 100,
  "total": 1,
  "dtypes": [{ "dtype": "phone", "count": 1 }],
  "results": [
    {
      "id": 1,
      "brand": "apple",
      "model": "iPhone14,2",
      "model_name": "iPhone 13 Pro",
      "code": "d63"
      // ... 其他字段
    }
  ],
  "originalQuery": "小米 13",
  "usedQuery": "xiaomi 13",
  "fallbackType": "translated_brand" // or 'brand_fallback' or ''
}
```

**错误响应**:

```json
{
  "error": "搜索失败",
  "detail": "错误详细信息"
}
```
