import { Hono } from 'hono'

const app = new Hono()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json; charset=utf-8',
}

app.get('/vslist', async (c) => {
  const targetUrl = 'https://mcapks.net/api/get-vslist.php'

  try {
    const res = await fetch(targetUrl)
    if (!res.ok) {
      return c.json(
        {
          success: false,
          error: { code: res.status, message: '上游服务器请求失败' },
        },
        res.status as any,
        corsHeaders,
      )
    }
    const data = await res.text()
    return new Response(data, { status: 200, headers: corsHeaders })
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: { code: 500, message: `服务器内部错误: ${err.message}` },
      },
      500,
      corsHeaders,
    )
  }
})

app.get('/download', async (c) => {
  const version = c.req.query('version')
  const type = c.req.query('type')

  if (!version) {
    return c.json(
      {
        success: false,
        error: { code: 400, message: '缺少 version 参数' },
      },
      400,
      corsHeaders,
    )
  }

  let targetUrl = `https://mcapks.net/api/get-download.php?version=${version}`
  if (type) targetUrl += `&type=${type}`

  try {
    const res = await fetch(targetUrl)
    if (!res.ok) {
      return c.json(
        {
          success: false,
          error: { code: res.status, message: '上游服务器请求失败' },
        },
        res.status as any,
        corsHeaders,
      )
    }
    const data = await res.text()
    return new Response(data, { status: 200, headers: corsHeaders })
  } catch (err: any) {
    return c.json(
      {
        success: false,
        error: { code: 500, message: `服务器内部错误: ${err.message}` },
      },
      500,
      corsHeaders,
    )
  }
})

export default app
