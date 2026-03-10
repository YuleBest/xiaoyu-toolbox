import { Hono } from 'hono'

const app = new Hono()

app.get('/parse', async (c) => {
  const shortUrl = c.req.query('url')

  if (!shortUrl || !shortUrl.startsWith('https://v.douyin.com/')) {
    return c.json({ ok: false, message: '非法或缺少 url' }, 400)
  }

  const ua =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

  try {
    const resp = await fetch(shortUrl, {
      headers: { 'User-Agent': ua },
      redirect: 'follow',
    })
    const html = await resp.text()

    const videoId = html.match(/video_id=([a-zA-Z0-9]+)/)?.[1]
    const nickname = html.match(/"nickname":"([^"]+)"/)?.[1]
    const createTs = html.match(/"create_time":(\d+)/)?.[1]

    const commentCount = html.match(/"comment_count":(\d+)/)?.[1]
    const diggCount = html.match(/"digg_count":(\d+)/)?.[1]
    const shareCount = html.match(/"share_count":(\d+)/)?.[1]

    if (!videoId || !nickname || !createTs) {
      return c.json({ ok: false, message: '解析失败，页面结构可能已变' }, 400)
    }

    const d = new Date(Number(createTs) * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const createTime = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    const safeNickname = nickname.replace(/[/:*?"<>|]/g, '')

    return c.json({
      ok: true,
      data: {
        videoId,
        nickname,
        createTime,
        statistics: {
          commentCount: Number(commentCount || 0),
          diggCount: Number(diggCount || 0),
          shareCount: Number(shareCount || 0),
        },
        downloadApi: `/api/dydown/download?videoId=${videoId}&filename=${encodeURIComponent(`${createTime}_${safeNickname}.mp4`)}`,
        previewApi: `/api/dydown/preview?videoId=${videoId}`,
      },
    })
  } catch {
    return c.json({ ok: false, message: '服务端请求异常' }, 500)
  }
})

app.get('/download', async (c) => {
  const videoId = c.req.query('videoId')
  const filename = c.req.query('filename') || 'douyin.mp4'

  if (!videoId) return c.text('Missing videoId', 400)

  const playUrl = `https://www.iesdouyin.com/aweme/v1/play/?video_id=${videoId}&ratio=1080p&line=0`

  const upstream = await fetch(playUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  if (!upstream.ok) return c.text('抖音源站错误', upstream.status as any)

  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Content-Type', 'video/mp4')

  const safeFilename = encodeURIComponent(filename)
  headers.set(
    'Content-Disposition',
    `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
  )

  const contentLength = upstream.headers.get('Content-Length')
  if (contentLength) {
    headers.set('Content-Length', contentLength)
  }

  return new Response(upstream.body, { status: upstream.status, headers })
})

app.get('/preview', async (c) => {
  const videoId = c.req.query('videoId')

  if (!videoId) return c.text('Missing videoId', 400)

  const playUrl = `https://www.iesdouyin.com/aweme/v1/play/?video_id=${videoId}&ratio=1080p&line=0`

  const upstream = await fetch(playUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  const headers = new Headers(upstream.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Content-Type', 'video/mp4')
  headers.set('Content-Disposition', 'inline')

  return new Response(upstream.body, { status: upstream.status, headers })
})

export default app
