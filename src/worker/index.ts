import { Hono } from 'hono'
import type { ExecutionContext, R2Bucket, ScheduledController } from '@cloudflare/workers-types'
import { syncJichacha } from './scheduled/jichacha'
import animeSearch from './routes/anime-search'
import bilidown from './routes/bilidown'
import dydown from './routes/dydown'
import frankfurter from './routes/frankfurter'
import getmcpe from './routes/getmcpe'
import hhsh from './routes/hhsh'
import lyric from './routes/lyric'
import weather from './routes/weather'
import alarm from './routes/alarm'
import cron from './routes/cron'
import nitpicker from './routes/nitpicker'

const app = new Hono().basePath('/api')

app.route('/anime-search', animeSearch)
app.route('/bilidown', bilidown)
app.route('/dydown', dydown)
app.route('/frankfurter', frankfurter)
app.route('/getmcpe', getmcpe)
app.route('/hhsh', hhsh)
app.route('/lyric', lyric)
app.route('/weather', weather)
app.route('/alarm', alarm)
app.route('/cron', cron)
app.route('/nitpicker', nitpicker)

/**
 * 运行时数据服务（run_worker_first 的 /database/*）：
 * - jichacha：每小时由 GitHub Actions 同步进 R2（绑定 DATA），本地开发回退到 ASSETS
 * - hok：代理 YuleBest/GetHOK 仓库的 data 目录，边缘缓存（raw.githubusercontent 国内不可达）
 * - 其余：静态资源
 */
const HOK_UPSTREAM = 'https://raw.githubusercontent.com/YuleBest/GetHOK/main/data'

const CONTENT_TYPES: Record<string, string> = {
  json: 'application/json;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
  jpg: 'image/jpeg',
  png: 'image/png',
}

function contentTypeFor(pathname: string): string {
  return CONTENT_TYPES[pathname.split('.').pop() ?? ''] ?? 'application/octet-stream'
}

interface Env {
  DATA: R2Bucket
  ASSETS: { fetch(request: Request): Promise<Response> }
}

interface CacheLike {
  default: {
    match(request: Request | URL): Promise<Response | undefined>
    put(request: Request | URL, response: Response): Promise<void>
  }
}

const DATABASE_CACHE = 'public, max-age=300, stale-while-revalidate=3600'

async function serveDatabase(request: Request, env: Env, waitUntil: (p: Promise<unknown>) => void): Promise<Response> {
  const url = new URL(request.url)
  const dir = url.pathname.split('/')[2]

  if (dir === 'jichacha') {
    const obj = await env.DATA.get(url.pathname.slice(1))
    if (obj) {
      const headers = new Headers({
        'content-type': contentTypeFor(url.pathname),
        'cache-control': DATABASE_CACHE,
        etag: obj.httpEtag,
      })
      return new Response(obj.body as unknown as ReadableStream, { headers })
    }
  }

  if (dir === 'hok') {
    const cache = (globalThis as unknown as { caches: CacheLike }).caches.default
    const cacheKey = new URL(url)
    cacheKey.search = ''
    const cached = await cache.match(cacheKey)
    if (cached) return cached

    const upstream = await fetch(`${HOK_UPSTREAM}/${url.pathname.slice('/database/hok/'.length)}`)
    if (upstream.ok) {
      const isImage = /\.(jpg|png)$/.test(url.pathname)
      const response = new Response(upstream.body, {
        headers: {
          'content-type': contentTypeFor(url.pathname),
          'cache-control': isImage
            ? 'public, max-age=604800'
            : 'public, max-age=3600, stale-while-revalidate=86400',
        },
      })
      waitUntil(cache.put(cacheKey, response.clone()))
      return response
    }
    return new Response(null, { status: upstream.status })
  }

  return env.ASSETS.fetch(request)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/database/')) {
      if (request.method !== 'GET') return env.ASSETS.fetch(request)
      return serveDatabase(request, env, (p) => ctx.waitUntil(p))
    }
    return app.fetch(request, env, ctx)
  },

  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    await syncJichacha(env)
  },
}
