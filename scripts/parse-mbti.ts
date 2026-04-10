import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface RawQuestion {
  id: number
  text: string
  pos: string
  neg: string
}

interface ParsedQuestion {
  id: number
  question: string
  optionA: string
  optionB: string
  pos: string
  neg: string
}

const raw: RawQuestion[] = JSON.parse(
  readFileSync(join(process.cwd(), 'public/database/mbti/mbti.json'), 'utf-8'),
)

const parsed: ParsedQuestion[] = raw.map((item) => {
  // 匹配格式：题干 A[.] 选项A B[.] 选项B
  const match = item.text.match(/^(.*?)\s+A[.．]?\s+(.+?)\s+B[.．]?\s+(.+)$/)
  if (!match) {
    throw new Error(`解析失败 #${item.id}: ${item.text}`)
  }
  return {
    id: item.id,
    question: match[1]!.trim(),
    optionA: match[2]!.trim(),
    optionB: match[3]!.trim(),
    pos: item.pos,
    neg: item.neg,
  }
})

writeFileSync(
  join(process.cwd(), 'public/database/mbti/mbti-parsed.json'),
  JSON.stringify(parsed, null, 2),
  'utf-8',
)

console.log(`✓ 解析完成，共 ${parsed.length} 道题`)
parsed.slice(0, 3).forEach((q) => {
  console.log(`  #${q.id}: ${q.question} | A: ${q.optionA} | B: ${q.optionB} | ${q.pos}/${q.neg}`)
})
