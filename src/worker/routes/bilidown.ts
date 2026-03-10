import { Hono } from 'hono'

const app = new Hono()

const getQualityDesc = (quality: number) => {
  const qualityMap: Record<number, string> = {
    127: '8K 超高清',
    126: '杜比视界',
    125: 'HDR 真彩',
    120: '4K 超清',
    116: '1080P 60帧',
    112: '1080P 高码率',
    80: '1080P 高清',
    74: '720P 60帧',
    64: '720P 高清',
    48: '720P 高清',
    32: '480P 清晰',
    16: '360P 流畅',
  }
  return qualityMap[quality] || `${quality}P`
}

app.get('/parse', async (c) => {
  const bvid = c.req.query('bvid')
  const cookie = c.req.query('cookie') || ''

  if (!bvid || !bvid.match(/^BV[a-zA-Z0-9]+$/)) {
    return c.json({ ok: false, message: '非法的 BV 号格式' }, 400)
  }

  const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

  try {
    const pageListResp = await fetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`, {
      headers: { 'User-Agent': ua },
    })
    const pageListData: any = await pageListResp.json()

    if (!pageListData.data?.[0]) {
      return c.json({ ok: false, message: '未找到视频信息' }, 400)
    }

    const videoInfo = pageListData.data[0]
    const cid = videoInfo.cid
    const title = videoInfo.part || '未知标题'
    const duration = videoInfo.duration || 0
    const cover = videoInfo.first_frame || ''

    const playUrlApi = `https://api.bilibili.com/x/player/playurl?fnval=80&cid=${cid}&bvid=${bvid}`
    const playHeaders: Record<string, string> = {
      Referer: 'https://www.bilibili.com/',
      'User-Agent': ua,
    }
    if (cookie) playHeaders.Cookie = cookie

    const playUrlResp = await fetch(playUrlApi, { headers: playHeaders })
    const playUrlData: any = await playUrlResp.json()
    const dash = playUrlData.data?.dash

    if (!dash) {
      return c.json(
        {
          ok: false,
          message: '无法解析 DASH 数据，请检查 Cookie 是否有效',
        },
        400,
      )
    }

    const supportFormats = playUrlData.data.support_formats || []
    const supportMap = new Map(supportFormats.map((f: any) => [f.quality, f]))

    const videoStreams = dash.video.map((v: any) => {
      const supportInfo = supportMap.get(v.id)
      return {
        quality: v.id,
        qualityDesc: (supportInfo as any)?.new_description || getQualityDesc(v.id),
        displayDesc: (supportInfo as any)?.display_desc || '',
        superscript: (supportInfo as any)?.superscript || '',
        url: v.baseUrl || v.base_url,
        width: v.width,
        height: v.height,
        codecs: v.codecs,
        bandwidth: v.bandwidth,
        downloadUrl: `/api/bilidown/download?type=video&url=${encodeURIComponent(v.baseUrl || v.base_url)}`,
      }
    })

    const audioStreams = dash.audio.map((a: any) => ({
      id: a.id,
      quality: a.id,
      url: a.baseUrl || a.base_url,
      bandwidth: a.bandwidth,
      codecs: a.codecs,
      downloadUrl: `/api/bilidown/download?type=audio&url=${encodeURIComponent(a.baseUrl || a.base_url)}`,
    }))

    return c.json({
      ok: true,
      data: {
        bvid,
        cid,
        title,
        cover,
        duration,
        videoStreams,
        audioStreams,
      },
    })
  } catch (error: any) {
    return c.json(
      {
        ok: false,
        message: `服务器内部错误: ${error.message}`,
      },
      500,
    )
  }
})

app.get('/download', async (c) => {
  const downloadUrl = c.req.query('url')
  const type = c.req.query('type') || 'video'
  const filename =
    c.req.query('filename') || `bili_${Date.now()}.${type === 'audio' ? 'm4a' : 'mp4'}`

  if (!downloadUrl) return c.text('Missing url', 400)

  const upstream = await fetch(downloadUrl, {
    headers: {
      Referer: 'https://www.bilibili.com/',
      'User-Agent': 'Mozilla/5.0',
    },
  })

  const safeFilename = encodeURIComponent(filename)

  const headers = new Headers()
  headers.set('Content-Type', type === 'audio' ? 'audio/mp4' : 'video/mp4')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set(
    'Content-Disposition',
    `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
  )

  const len = upstream.headers.get('Content-Length')
  if (len) headers.set('Content-Length', len)

  // Use raw response body since it's a proxy
  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
})

export default app
