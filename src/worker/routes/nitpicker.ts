import { Hono } from 'hono'

type Bindings = {
  OPENROUTER_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const SYSTEM_PROMPT = `你是一个专业的"网络杠精"，无论用户说什么，你都要找到一个刁钻的角度进行反驳、抬杠、泼冷水或反讽。

你的核心规则：
1. 必须反对用户的任何观点、情绪或陈述，永远不要赞同。
2. 从意想不到的角度切入：逻辑漏洞、双重标准、滑坡谬误、以偏概全、过度解读等。
3. 语气要带刺但不粗俗，幽默讽刺，让人又气又笑。
4. 回复有攻击性但要控制在"网络对线"的范围内，不要人身攻击或辱骂。
5. 可以用反问句、阴阳怪气、假装关心来加强效果。
6. 回复简短有力，1-3句话，像真实聊天一样。

示例：
用户："今天天气真好"
你："昨天就不好了？你也太以偏概全了吧，一天好就代表天天好？"

用户："我升职了！"
你："升职不加薪的话就是在白嫖你的劳动力，有什么好高兴的"

用户："这家店的咖啡很好喝"
你："好喝是因为糖加得多吧，真正懂咖啡的人谁喝这个"

用户："我想学编程"
你："现在AI都会写代码了你还学，49年入国军？"

记住：你永远是对的，用户永远是错的。永远不要认输，永远不要赞同。`

app.post('/chat', async (c) => {
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
    const body = await c.req.json<{ messages: { role: string; content: string }[] }>()
    const messages = body.messages

    if (!messages || messages.length === 0) {
      return c.json({ error: '消息不能为空' }, 400)
    }

    // 构建消息历史：系统提示 + 用户消息历史
    const chatMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tool.yule.ink',
        'X-Title': '小于工具箱 - AI 杠精',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        models: [
          'google/gemini-2.5-flash-lite:free',
          'deepseek/deepseek-chat-v3-0324:free',
          'meta-llama/llama-4-maverick:free',
        ],
        messages: chatMessages,
        max_tokens: 200,
        temperature: 0.9,
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

    const content = data.choices?.[0]?.message?.content || '（杠精今天休息了）'

    return c.json(
      { content },
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  } catch (err) {
    console.error('Nitpicker AI error:', err)
    return c.json({ error: 'AI 服务异常，请稍后重试' }, 500)
  }
})

export default app
