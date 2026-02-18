# 机查查 API 文档

该文档描述了 `/api/jichacha` 下的 API 接口。

## 基础 URL

API 的基础路径为 `/api/jichacha`。

## 接口列表

### 1. 获取品牌列表 (Detail)

获取数据库中所有去重后的品牌列表，按数量降序排列。

- **URL**: `/detail`
- **方法**: `GET`
- **描述**: 返回包含品牌名称、品牌标题及该品牌下机型数量的列表。

**请求参数**:

无。

**响应示例**:

```json
{
  "success": true,
  "results": [
    {
      "brand": "apple",
      "brand_title": "苹果",
      "count": 50
    },
    {
      "brand": "xiaomi",
      "brand_title": "小米",
      "count": 45
    }
    // ...
  ]
}
```

**缓存策略**:

- `Cache-Control: public, max-age=86400` (缓存 1 天)

---

### 2. 搜索机型 (Search)

搜索手机机型数据，支持通用模糊搜索和字段精确/模糊过滤。

- **URL**: `/search`
- **方法**: `GET`
- **描述**: 根据关键词或特定字段筛选机型数据。

**请求参数 (Query Params)**:

| 参数名       | 类型   | 必填 | 默认值 | 描述                                                                                   |
| :----------- | :----- | :--- | :----- | :------------------------------------------------------------------------------------- |
| `q`          | string | 否   | -      | 通用搜索关键词。同时匹配 `model`, `code`, `code_alias`, `model_name` 字段 (模糊匹配)。 |
| `limit`      | number | 否   | 50     | 返回结果的最大数量。                                                                   |
| `model`      | string | 否   | -      | 机型型号 (模糊匹配)。                                                                  |
| `dtype`      | string | 否   | -      | 设备类型 (模糊匹配)。                                                                  |
| `brand`      | string | 否   | -      | 品牌代码 (模糊匹配)。                                                                  |
| `code`       | string | 否   | -      | 内部代号 (模糊匹配)。                                                                  |
| `code_alias` | string | 否   | -      | 代号别名 (模糊匹配)。                                                                  |
| `model_name` | string | 否   | -      | 机型名称 (模糊匹配)。                                                                  |
| `ver_name`   | string | 否   | -      | 版本名称 (模糊匹配)。                                                                  |

**主要逻辑**:

1.  如果有 `q` 参数，会添加 `AND (model LIKE %q% OR code LIKE %q% OR code_alias LIKE %q% OR model_name LIKE %q%)` 条件。
2.  如果有特定字段参数 (如 `brand`)，会添加 `AND brand LIKE %val%` 条件。
3.  所有条件均为 `AND` 关系。

**响应示例**:

```json
{
  "success": true,
  "total": 1,
  "results": [
    {
      "id": 1,
      "brand": "apple",
      "model": "iPhone14,2",
      "model_name": "iPhone 13 Pro",
      "code": "d63"
      // ... 其他字段
    }
    // ...
  ]
}
```

**错误响应**:

```json
{
  "error": "搜索失败",
  "detail": "错误详细信息"
}
```
