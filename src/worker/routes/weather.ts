import { Hono } from 'hono'

type Bindings = {
  QWEATHER_API_HOST: string
  QWEATHER_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.all('/*', async (c) => {
  const path = c.req.path.replace(/^\/api\/weather\/?/, '')
  const url = new URL(c.req.url)
  const searchParams = new URLSearchParams(url.search)

  if (c.env.QWEATHER_API_KEY) {
    searchParams.set('key', c.env.QWEATHER_API_KEY)
  } else {
    return c.json({ error: 'Missing QWEATHER_API_KEY' }, 500)
  }

  const host = c.env.QWEATHER_API_HOST || 'api.qweather.com'
  const upstreamUrl = `https://${host}/${path}?${searchParams.toString()}`

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Xiaoyu-Toolbox Proxy',
      },
    })

    const data = await upstreamResponse.text()

    const newHeaders = new Headers()
    newHeaders.set('Content-Type', 'application/json; charset=utf-8')
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type')

    return new Response(data, {
      status: upstreamResponse.status,
      headers: newHeaders,
    })
  } catch (error: any) {
    return c.json(
      {
        ok: false,
        message: `Weather API Proxy error: ${error.message}`,
      },
      500 as any,
      corsHeaders,
    )
  }
})

export default app
