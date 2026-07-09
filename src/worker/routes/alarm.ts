import { Hono } from 'hono'

type Bindings = Record<string, never>

const app = new Hono<{ Bindings: Bindings }>()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function corsResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  })
}

app.get('/list', async (c) => {
  const params = c.req.query()
  const searchParams = new URLSearchParams()
  searchParams.set('pageNo', params.pageNo || '1')
  searchParams.set('pageSize', params.pageSize || '20')
  searchParams.set('signaltype', params.signaltype || '')
  searchParams.set('signallevel', params.signallevel || '')
  searchParams.set('province', params.province || '')
  searchParams.set('_', Date.now().toString())

  const upstreamUrl = `https://www.nmc.cn/rest/findAlarm?${searchParams.toString()}`

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.nmc.cn/',
        'Accept': 'application/json, text/plain, */*',
      },
    })
    const data = await res.text()
    return corsResponse(data, res.status)
  } catch (err: any) {
    return corsResponse(JSON.stringify({ code: -1, msg: `proxy error: ${err.message}`, data: null }), 500)
  }
})

app.get('/detail', async (c) => {
  const url = c.req.query('url')
  if (!url) {
    return corsResponse(JSON.stringify({ error: 'missing url' }), 400)
  }

  try {
    const res = await fetch(`https://www.nmc.cn${url}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Xiaoyu-Toolbox/1.0)' },
    })
    const html = await res.text()

    const blocks = html.matchAll(/<div[^>]*id=["']?alarmtext["']?[^>]*>([\s\S]*?)<\/div>/gi)
    const texts: string[] = []
    for (const block of blocks) {
      if (!block[1]) continue
      const inner = block[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
      if (inner) texts.push(inner)
    }
    const content = texts.join('\n\n')

    return corsResponse(JSON.stringify({ content }), 200)
  } catch (err: any) {
    return corsResponse(JSON.stringify({ error: `proxy error: ${err.message}` }), 500)
  }
})

export default app
