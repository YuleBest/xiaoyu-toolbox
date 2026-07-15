import { Hono } from 'hono'

type Bindings = {
  OPENROUTER_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const SYSTEM_PROMPT = `你是一个 Cron 表达式生成助手。用户会用自然语言描述定时任务需求，你需要返回一个标准的 5 位 Cron 表达式。

Cron 表达式格式（空格分隔）：
分钟(0-59) 小时(0-23) 日(1-31) 月(1-12) 星期(0-7, 0和7都表示周日)

特殊字符：
- * 表示所有值
- */N 表示每 N 个单位
- N-M 表示范围
- N,M 表示列表

常见示例：
- 每分钟: * * * * *
- 每5分钟: */5 * * * *
- 每小时整点: 0 * * * *
- 每天零点: 0 0 * * *
- 工作日早9点: 0 9 * * 1-5
- 每周一零点: 0 0 * * 1
- 每月1日零点: 0 0 1 * *
- 每年1月1日零点: 0 0 1 1 *
- 工作日9-18点每小时: 0 9-18 * * 1-5
- 每2小时: 0 */2 * * *

严格规则：
1. 只输出 Cron 表达式本身，不要有任何解释、标记或额外文字。
2. 必须是恰好 5 个字段，空格分隔。
3. 只在用户明确指定时才使用非 * 值。如果用户说"每天"，日和星期都用 *。
4. 如果用户的描述模糊或无法确定，选择最合理的默认值（通常用 *）。`

app.post('/ai-generate', async (c) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = c.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return c.json({ error: 'OpenRouter API key not configured' }, 500)
  }

  try {
    const body = await c.req.json<{ prompt: string }>()
    const userPrompt = body.prompt?.trim()

    if (!userPrompt) {
      return c.json({ error: '请输入描述' }, 400)
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tool.yule.ink',
        'X-Title': '小于工具箱 - Cron 表达式生成',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        models: [
          'google/gemini-2.5-flash-lite:free',
          'deepseek/deepseek-chat-v3-0324:free',
          'meta-llama/llama-4-maverick:free',
        ],
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return c.json({ error: `AI 服务请求失败 (${response.status})` }, 502)
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }

    const rawContent = data.choices?.[0]?.message?.content || ''
    // 清理输出：只提取 cron 表达式
    const cronMatch = rawContent.trim().match(/(\S+\s+\S+\s+\S+\s+\S+\s+\S+)/)
    const expression = cronMatch ? cronMatch[1] : rawContent.trim()

    return c.json(
      { expression },
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  } catch (err) {
    console.error('Cron AI generate error:', err)
    return c.json({ error: 'AI 服务异常，请稍后重试' }, 500)
  }
})

export default app
