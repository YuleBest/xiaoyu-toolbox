import { Hono } from 'hono'

const app = new Hono()

app.post('/guess', async (c) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const payload = await c.req.text()

    const response = await fetch('https://lab.magiconch.com/api/nbnhhsh/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    return c.json(
      {
        ok: false,
        message: `服务器代理请求失败: ${error.message}`,
      },
      500 as any,
      corsHeaders,
    )
  }
})

app.post('/translation/:name', async (c) => {
  const name = c.req.param('name')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (!name) {
    return c.json({ ok: false, message: '缺少缩写名称参数' }, 400 as any, corsHeaders)
  }

  try {
    const payload = await c.req.text()
    const encodedName = encodeURIComponent(name)

    const response = await fetch(
      `https://lab.magiconch.com/api/nbnhhsh/translation/${encodedName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      },
    )

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    return c.json(
      {
        ok: false,
        message: `服务器代理请求失败: ${error.message}`,
      },
      500 as any,
      corsHeaders,
    )
  }
})

export default app
