import { Hono } from 'hono'

const app = new Hono()

app.post('/search', async (c) => {
  const formData = await c.req.formData()
  const image = formData.get('image')
  const cutBorders = c.req.query('cutBorders') !== undefined

  if (!image) {
    return c.json({ error: 'No image provided' }, 400)
  }

  const url = new URL('https://api.trace.moe/search')
  if (cutBorders) {
    url.searchParams.set('cutBorders', '')
  }
  url.searchParams.set('anilistInfo', '')

  const headers: Record<string, string> = {}
  // @ts-expect-error: environment variable might not be defined in types
  if (c.env.TRACE_MOE_KEY) {
    // @ts-expect-error: environment variable might not be defined in types
    headers['x-trace-key'] = c.env.TRACE_MOE_KEY
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: image,
      headers: {
        ...headers,
        'Content-Type': (image as File).type || 'image/jpeg',
      },
    })

    const data = await response.json()
    return c.json(data, response.status as any)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

app.get('/me', async (c) => {
  const headers: Record<string, string> = {}
  // @ts-expect-error: environment variable might not be defined in types
  if (c.env.TRACE_MOE_KEY) {
    // @ts-expect-error: environment variable might not be defined in types
    headers['x-trace-key'] = c.env.TRACE_MOE_KEY
  }

  try {
    const response = await fetch('https://api.trace.moe/me', {
      headers,
    })
    const data = await response.json()
    return c.json(data, response.status as any)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default app
