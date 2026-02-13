# 🎵 Music Lyric API (Cloudflare Worker 版)

这是一个基于 Cloudflare Worker 开发的轻量级歌词搜索与获取接口，支持跨域请求 (CORS)，并内置了高效的 CDN 缓存。

## 🛠 接口列表

### 1. 搜索歌曲

根据关键词（歌名、歌手等）搜索匹配的歌曲列表。

- 路径: /search
- 方法: GET
- 参数: `keyword`: 搜索关键词
- 请求示例: `GET /search?keyword=周杰伦%20七里香`
- 响应示例:

```json
[
  {
    "title": "七里香",
    "artist": "周杰伦",
    "album": "七里香",
    "hash": "2c7ceb6cc2340ecc8948e0ace62f0cf8",
    "duration": 299
  }
]
```

### 2. 获取歌词

根据歌曲的唯一 Hash 值获取对应的标准 LRC 格式歌词。

- 路径: /lyric
- 方法: GET
- 参数: `hash`: 歌曲唯一标识
- 请求示例: `GET /lyric?hash=2c7ceb6cc2340ecc8948e0ace62f0cf8`
- 响应示例:

```lrc
[ar:周杰伦]
[ti:七里香]
[00:00.00]周杰伦 - 七里香
[00:27.74]窗外的麻雀在电线杆上多嘴
[00:34.49]你说这一句很有夏天的感觉
```
