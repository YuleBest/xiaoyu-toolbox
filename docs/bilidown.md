# bilibili 视频解析原理

1. 携带手机的 User-Agent 请求 `https://api.bilibili.com/x/player/pagelist?bvid=[视频BV号，用户填写]`

示例：`https://api.bilibili.com/x/player/pagelist?bvid=BV1pT41157it`

2. 解析返回的 JSON 数据，确保 `message` 为 `OK`，获取 `data` 中的 `cid` 字段，也可以解析标题、封面等备用：

```json
{
  "code": 0,
  "message": "OK",
  "ttl": 1,
  "data": [
    {
      "cid": 746904707, // cid
      "page": 1,
      "from": "vupload",
      "part": "“她终于住进了那双对众生漠然的眼睛”", // 视频标题
      "duration": 30,
      "vid": "",
      "weblink": "",
      "dimension": {
        "width": 3840,
        "height": 2160,
        "rotate": 0
      },
      "first_frame": "http://i0.hdslb.com/bfs/storyff/n220614a23e3ohfyk7fkihs6tlibm61z_firsti.jpg", // 视频封面
      "ctime": 0
    }
  ]
}
```

3. 构造视频接口链接，注意该接口有cid和bvid两个参数：`https://api.bilibili.com/x/player/playurl?fnval=80&cid=[视频cid，上一步获取]&bvid=[视频BV号，用户填写]`。

a. 无 Cookie 情况下，最多只能获取到 480P 的视频，所以需要引导用户通过浏览器获取 Cookie 并填写。将 Cookie 添加到 requests 请求头中：

```python
headers = {
  "Referer": "https://www.bilibili.com/",  # 必须传，不然报403
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",  # 必须传，不然报403
  "Cookie": "YOUR_COOKIE"  # 替换为B站Cookie，可不传，但最高只能获取到480P的视频
}
```

b. 抓取的视频和音频是分离的，两个都是 m4s 格式，所以需要进行合并。例如使用 FFMpeg 进行合并：

```bash
ffmpeg -i video_part.m4s -i audio.mp4 -c:v copy -c:a copy output.mp4
```

接口会返回一个 JSON 数据，确保 `message` 为 `OK`：

```json
{
  "code": 0,
  "message": "OK",
  "ttl": 1,
  "data": {
    "from": "local",
    "result": "suee",
    "message": "",
    "quality": 32,
    "format": "flv480",
    "timelength": 29604,
    "accept_format": "flv_p60,flv,flv720,flv480,mp4",
    "accept_description": [
      // 清晰度列表，不要用这个直接进行展示，因为这个只是提示，实际下载的清晰度由support_format决定
      "高清 1080P60",
      "高清 1080P",
      "高清 720P",
      "清晰 480P",
      "流畅 360P"
    ],
    "accept_quality": [116, 80, 64, 32, 16], // 清晰度id，对应accept_description，**未登录状态下最高只能获取480P的视频**，所以此处需要传入Token才行
    "video_codecid": 7,
    "seek_param": "start",
    "seek_type": "offset",
    "dash": {
      "duration": 30,
      "minBufferTime": 1.5,
      "min_buffer_time": 1.5,
      "video": [
        // 多个清晰度的视频下载链接
        {
          "id": 32, // 根据accept_quality选择
          "baseUrl": "https://upos-sz-estghw.bilivideo.com/upgcxcode/07/47/746904707/746904707-1-30032.m4s?e=ig...B3B63BF-F723-01FA-A0FC-7CDA78D7E1B960121infoc&build=0&dl=0&orderid=0,3", // 视频下载链接
          "base_url": "...", // 内容和上面的一样，统一使用baseUrl即可
          "backupUrl": [
            "https...id=1,3", // 备份链接，不用管
            "https...id=1,3" // 备份链接，不用管
          ],
          "backup_url": [
            // ...
          ],
          "bandwidth": 786055,
          "mimeType": "video/mp4",
          "mime_type": "video/mp4",
          "codecs": "avc1.64001F",
          "width": 852,
          "height": 480,
          "frameRate": "29.412",
          "frame_rate": "29.412",
          "sar": "1:1",
          "startWithSap": 1,
          "start_with_sap": 1,
          "SegmentBase": {
            "Initialization": "0-990",
            "indexRange": "991-1094"
          },
          "segment_base": {
            "initialization": "0-990",
            "index_range": "991-1094"
          },
          "codecid": 7
        },
        {
          "id": 32, // 每个清晰度会有两个链接，规格稍有不同，用户端不必理会
          // ...
          "width": 852,
          "height": 480,
          "frameRate": "30.303", // 帧率规格不同
          "frame_rate": "30.303",
          // ...
        },
        { // 同上
          "id": 16,
          // ...
        },
      // ...
      "audio": [  // 音频下载链接
        {
          "id": 30216,  // 音频id
          "baseUrl": "https://u...B960121infoc&build=0&orderid=0,3",
          "base_url": "https://u...B960121infoc&build=0&orderid=0,3",
          "backupUrl":
            // ...
          ],
          "backup_url": [
            // ...
          ],
          "bandwidth": 67922,
          "mimeType": "audio/mp4",
          "mime_type": "audio/mp4",
          "codecs": "mp4a.40.2",
          "width": 0,
          "height": 0,
          "frameRate": "",
          "frame_rate": "",
          "sar": "",
          "startWithSap": 0,
          "start_with_sap": 0,
          "SegmentBase": {
            "Initialization": "0-941",
            "indexRange": "942-1045"
          },
          "segment_base": {
            "initialization": "0-941",
            "index_range": "942-1045"
          },
          "codecid": 0
        },
        {
          "id": 30232,
          // ...
          "segment_base": {
            "initialization": "0-907",
            "index_range": "908-1011"
          },
          "codecid": 0
        },
        {
          "id": 30280,
          // ...
        }
      ],
      "dolby": {
        "type": 0,  // 是否杜比音频，0/1
        "audio": null  // 杜比音频的id
      },
      "flac": null  // FLAC音频的id
    },
    "support_formats": [  // 支持的清晰度
      {
        "quality": 116,
        "format": "flv_p60",
        "new_description": "1080P 60帧",
        "display_desc": "1080P",
        "superscript": "60帧",
        "codecs": ["avc1.640032", "hev1.1.6.L150.90"],
        "can_watch_qn_reason": 0,
        "limit_watch_reason": 0,
        "report": {}
      },
      {
        "quality": 80,
        "format": "flv",
        "new_description": "1080P 高清",
        "display_desc": "1080P",
        // ...
      },
      {
        "quality": 64,
        // ...
      },
      {
        "quality": 32,
        // ...
      },
      {
        "quality": 16,
        "format": "mp4",
        "new_description": "360P 流畅",
        "display_desc": "360P",
        // ...
      }
    ],
    "high_format": null,
    "last_play_time": 0,
    "last_play_cid": 0,
    "view_info": null,
    "play_conf": {
      "is_new_description": false
    },
    "cur_language": "",
    "cur_production_type": 0,
    "auto_qn_resp": {
      "dyeid": "186a204bb259587c004098c76978571e"
    }
  }
}
```
