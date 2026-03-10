import { Hono } from 'hono'

const app = new Hono()

app.get('/search', async (c) => {
  const keyword = c.req.query('keyword')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  if (!keyword) {
    return c.json({ error: '传个关键词呀，于乐' }, 400 as any, corsHeaders)
  }

  const searchUrl = `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(keyword)}&page=1&pagesize=5`

  try {
    const res = await fetch(searchUrl)
    const data: any = await res.json()

    const results = (data.data?.info || []).map((item: any) => ({
      title: item.songname,
      artist: item.singername,
      album: item.album_name,
      hash: item.hash,
      duration: item.duration,
    }))

    return new Response(JSON.stringify(results), { headers: corsHeaders })
  } catch {
    return c.json({ error: '搜索接口请求失败' }, 500 as any, corsHeaders)
  }
})

app.get('/get', async (c) => {
  const hash = c.req.query('hash')
  const format = c.req.query('format') || 'lrc'

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  if (!hash) {
    return c.json({ error: '没有 Hash 我也变不出歌词呀' }, 400 as any, corsHeaders)
  }

  const lyricUrl = `http://m.kugou.com/app/i/krc.php?cmd=100&hash=${hash}&timelength=300000`

  try {
    const res = await fetch(lyricUrl)
    let text = await res.text()
    text = text.replace(/^\ufeff/, '')

    if (format === 'json') {
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      const jsonResult: { info: Record<string, string>; lyrics: any[] } = { info: {}, lyrics: [] }

      lines.forEach((line) => {
        const infoMatch = line.match(/\[(ar|ti|al|by|hash|sign|qq|total|offset|id):(.*)\]/i)
        if (infoMatch) {
          if (infoMatch[1] && infoMatch[2]) {
            jsonResult.info[infoMatch[1].toLowerCase()] = infoMatch[2].trim()
          }
          return
        }
        const lyricMatch = line.match(/\[(\d+:\d+\.\d+)\](.*)/)
        if (lyricMatch && lyricMatch[1] && lyricMatch[2]) {
          jsonResult.lyrics.push({
            time: lyricMatch[1],
            text: lyricMatch[2].trim(),
          })
        }
      })
      return new Response(JSON.stringify(jsonResult), { headers: corsHeaders })
    }

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch {
    return c.json({ error: '获取歌词失败' }, 500 as any, corsHeaders)
  }
})

export default app
