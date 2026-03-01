# [MCAPKS API 文档](https://mcapks.net/)

我的世界下载站API提供了获取版本信息和下载链接的接口服务。当前已通过 Cloudflare 代理转发。

## 基础信息

- **接口代理根路径:** `/api/getmcpe`
- **版本:** v1.0
- **数据格式:** JSON
- **字符编码:** UTF-8

## 功能特性

- 获取完整版本列表
- 根据版本号获取下载链接
- 支持多种下载方式
- 详细的错误信息返回

## 获取版本列表

GET

/api/getmcpe/vslist

#### 描述

获取所有可用的我的世界版本信息，包括版本号、发布时间、文件大小等详细信息。

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
| ------ | ---- | ---- | ---- |
| 无     |      |      |      |

#### 响应示例

###### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 150,
    "versions": [
      {
        "version": "1.20.81",
        "beta": true,
        "date": "2024-01-15",
        "size": "156.8 MB"
      },
      {
        "version": "1.20.80",
        "beta": false,
        "date": "2024-01-10",
        "size": "155.2 MB"
      }
    ]
  },
  "message": "获取成功"
}
```

## 获取下载链接

GET

/api/getmcpe/download

#### 描述

根据指定的版本号获取对应的下载链接信息。

#### 查询参数

| 参数名    | 类型   | 必需 | 描述                                            |
| --------- | ------ | ---- | ----------------------------------------------- |
| `version` | string | 是   | 游戏完整版本号                                  |
| `type`    | string | 否   | 游戏架构，v8a或v7a，默认返回v8a，无v8a时返回v7a |

#### 响应示例

###### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "version": "1.20.81",
    "type": "v8a",
    "downloads": [
      {
        "name": "官方下载",
        "url": "https://example.com/minecraft-1.20.81.apk"
      },
      {
        "name": "网盘下载",
        "url": "https://pan.example.com/s/abc123",
        "password": "1234"
      }
    ]
  },
  "message": "获取成功"
}
```

## 错误代码

API使用标准HTTP状态码，并返回详细的错误信息。

| 状态码 | 描述           |
| ------ | -------------- |
| 400    | 请求参数无效   |
| 404    | 指定版本不存在 |
| 429    | 请求频率超限   |
| 500    | 服务器内部错误 |

###### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "指定的版本不存在"
  }
}
```
