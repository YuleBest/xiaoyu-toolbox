# hhsh API 文档

该 API 用于查询中文社交媒体中常见的**首字母缩写（拼音缩写）**含义。

1. 基础信息

本 API 由 Cloudflare Pages Functions 代理，真实上游为 https://lab.magiconch.com/api/nbnhhsh/

- Base URL: /api/hhsh
- Content-Type: application/json

2. 查询缩写 (Guess)

根据提供的缩写文本，尝试匹配可能的中文含义。

- Endpoint: /guess
- Method: POST
- Payload:

```json
{
  "text": "awsl,nb"
}
```

- 字段说明: text 字段可以是以逗号分隔的多个缩写字符串。

响应示例：

```json
[
  {
    "name": "awsl",
    "trans": ["啊我死了", "阿伟死了"],
    "inputting": ["啊我睡了"]
  },
  {
    "name": "nb",
    "trans": ["牛逼", "拿笔"],
    "inputting": []
  }
]
```

- 字段定义:
  - name: 查询的缩写词。
  - trans: 已确定的翻译列表（Array）。若该字段为 null，表示无对应文字。
  - inputting: 拼音联想的候选词（常见于输入法联想）。

3. 提交新翻译 (Submit Translation)

当发现未收录的缩写或错误的解释时，可以提交新的对应关系。

- Endpoint: /translation/{name}
- Method: POST
- Path Parameter: {name} 为缩写原词（如 `yyds`）。
- Payload:

```json
{
  "text": "永远的神"
}
```

- 说明: 脚本建议格式：文字 (来源简注)，例如 永远的神 (电竞)。
- 响应: 提交后通常进入审核流程，不会立即生效。
