import { Hono } from 'hono'

const app = new Hono()

app.all('/*', async (c) => {
  // Extract path and default to 'latest'
  const path = c.req.path.replace(/^\/api\/frankfurter\/?/, '') || 'latest'
  const url = new URL(c.req.url)
  const search = url.search

  const upstreamUrl = `https://api.frankfurter.dev/v1/${path}${search}`

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Xiaoyu-Toolbox Proxy',
      },
    })

    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Content-Type', 'application/json; charset=utf-8')

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  } catch (error: any) {
    return c.json(
      {
        ok: false,
        message: `Frankfurter 代理请求失败: ${error.message}`,
      },
      500 as any,
      corsHeaders,
    )
  }
})

export default app
