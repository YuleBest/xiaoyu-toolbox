import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs-extra'
import path from 'path'
import iconv from 'iconv-lite'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../../../public/database/hok')

const HERO_LIST_URL = 'https://pvp.qq.com/web201605/js/herolist.json'
const ITEM_LIST_URL = 'https://pvp.qq.com/web201605/js/item.json'
const SUMMONER_LIST_URL = 'https://pvp.qq.com/web201605/js/summoner.json'

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': MOBILE_UA,
  },
})

async function downloadFile(url: string, dest: string) {
  try {
    const res = await axiosInstance.get(url, { responseType: 'arraybuffer' })
    await fs.outputFile(dest, res.data)
    console.log(`下载中: ${url} -> ${dest}`)
    return true
  } catch (error: any) {
    console.error(`下载失败 ${url}: ${error.message}`)
    return false
  }
}

async function fetchJson(url: string) {
  const res = await axiosInstance.get(url)
  return res.data
}

async function fetchHtml(url: string) {
  const res = await axiosInstance.get(url, { responseType: 'arraybuffer' })
  // Initial check for encoding, default to GBK as per note
  // However, axios arraybuffer gives raw data.
  // Note mentions: "Page encoding might be GBK".
  const html = iconv.decode(Buffer.from(res.data), 'gbk')
  return html
}

async function processHeroes() {
  console.log('获取英雄列表...')
  const heroList = await fetchJson(HERO_LIST_URL)
  // Always update list.json
  await fs.outputJson(path.join(DATA_DIR, 'hero/list.json'), heroList, {
    spaces: 2,
  })

  const targetHeroId = process.argv[2]
  const heroesToProcess = targetHeroId
    ? heroList.filter((h: any) => h.ename.toString() === targetHeroId)
    : heroList

  if (targetHeroId && heroesToProcess.length === 0) {
    console.error(`未找到英雄ID ${targetHeroId}`)
    return
  }

  const totalHeroes = heroesToProcess.length
  let currentHero = 0

  for (const hero of heroesToProcess) {
    currentHero++
    const ename = hero.ename
    const cname = hero.cname
    const id_name = hero.id_name

    const heroJsonPath = path.join(DATA_DIR, `hero/${ename}.json`)
    const heroImgPath = path.join(DATA_DIR, `hero/${ename}.jpg`)

    // Incremental check: if both JSON and Image exist, skip
    // Unless a specific target ID was provided, then force update for that ID?
    // User asked for incremental, so we skip if exists.
    // If user manually runs with ID, they probably want to update it.
    const isTargeted = !!targetHeroId
    if (!isTargeted && (await fs.pathExists(heroJsonPath)) && (await fs.pathExists(heroImgPath))) {
      // console.log(`Skipping hero ${cname} (${ename}) - already exists`);
      continue
    }

    console.log(`[${currentHero}/${totalHeroes}] 处理英雄: ${cname} (${ename})`)

    // 1. 下载头像
    if (!(await fs.pathExists(heroImgPath)) || isTargeted) {
      const avatarUrl = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${ename}/${ename}.jpg`
      await downloadFile(avatarUrl, heroImgPath)
    }

    // 2. 获取详情
    if (!(await fs.pathExists(heroJsonPath)) || isTargeted) {
      const detailUrl = `https://pvp.qq.com/web201605/herodetail/m/${id_name}.html`
      try {
        const html = await fetchHtml(detailUrl)
        const $ = cheerio.load(html)

        // 属性基于列表顺序，如注释
        // 1: 生存, 2: 攻击, 3: 技能, 4: 难度
        const survivalSpan = $('.hero-cover .cover-list li:nth-child(1) span').attr('class')
        const attackSpan = $('.hero-cover .cover-list li:nth-child(2) span').attr('class')
        const skillSpan = $('.hero-cover .cover-list li:nth-child(3) span').attr('class')
        const difficultySpan = $('.hero-cover .cover-list li:nth-child(4) span').attr('class')

        const heroTypeMap: any = {
          1: '战士',
          2: '法师',
          3: '坦克',
          4: '刺客',
          5: '射手',
          6: '辅助',
        }
        let occupation = heroTypeMap[hero.hero_type] || ''

        // 如果映射值为空，尝试解析 HTML（尽管列表数据应该是可靠的）
        if (!occupation) {
          occupation = $('.hero-location').text().trim()
          if (occupation.includes('游戏职业：')) {
            occupation = occupation.replace('游戏职业：', '')
          } else {
            // Fallback: try to find element with text "游戏职业："
            const occupationEl = $('*:contains("游戏职业：")').last()
            if (occupationEl.length > 0) {
              occupation = occupationEl.text().trim().replace('游戏职业：', '')
            }
          }
        }

        const heroDetail: any = {
          ename,
          cname,
          title: $('.hero-title').text().trim(),
          occupation,
          attributes: {
            survival: survivalSpan?.match(/hero-attr1-(\d+)/)?.[1],
            attack: attackSpan?.match(/hero-attr2-(\d+)/)?.[1],
            skill: skillSpan?.match(/hero-attr3-(\d+)/)?.[1],
            difficulty: difficultySpan?.match(/hero-attr4-(\d+)/)?.[1],
          },
          skins:
            $('.hero-skin')
              .data('imgname')
              ?.toString()
              .split('|')
              .map((s: string) => {
                const parts = s.split('&')
                return { name: parts[0], id: parts[1] }
              }) || [],
          skills: [],
        }

        // Skills
        // Icons: .plus-tab li img src
        // Info: .plus-content li
        const skillIcons: string[] = []
        $('.plus-tab li img').each((i: number, el: any) => {
          skillIcons.push($(el).attr('src') || '')
        })

        $('.plus-content li').each((i: number, el: any) => {
          const name = $(el).find('.plus-name').text().trim()
          if (!name) return // Skip empty skills

          const value = $(el).find('.plus-value').text().trim() // (冷却值：... 消耗：...)
          const desc = $(el).find('.plus-int').text().trim()
          const tip = $(el).find('.prompt').text().trim()

          heroDetail.skills.push({
            name,
            cooldownAttributes: value,
            description: desc,
            tips: tip,
            icon: skillIcons[i] ? `https:${skillIcons[i]}` : '',
          })
        })

        await fs.outputJson(heroJsonPath, heroDetail, { spaces: 2 })
      } catch (err: any) {
        console.error(`处理英雄详情失败 ${cname}: ${err.message}`)
      }
    }
  }
}

async function processItems() {
  console.log('获取道具列表...')
  const itemList = await fetchJson(ITEM_LIST_URL)
  await fs.outputJson(path.join(DATA_DIR, 'item/list.json'), itemList, {
    spaces: 2,
  })

  const totalItems = itemList.length
  let currentItem = 0

  for (const item of itemList) {
    currentItem++
    const itemId = item.item_id
    const pngPath = path.join(DATA_DIR, `item/${itemId}.png`)
    const jpgPath = path.join(DATA_DIR, `item/${itemId}.jpg`)

    if ((await fs.pathExists(pngPath)) || (await fs.pathExists(jpgPath))) {
      // console.log(`Skipping item ${itemId} - image already exists`);
      continue
    }

    // Try png, then jpg
    console.log(`[${currentItem}/${totalItems}] 处理道具: ${item.item_name} (${itemId})`)
    const pngUrl = `https://game.gtimg.cn/images/yxzj/img201606/itemimgo/${itemId}.png`
    const jpgUrl = `https://game.gtimg.cn/images/yxzj/img201606/itemimgo/${itemId}.jpg`

    let success = await downloadFile(pngUrl, pngPath)
    if (!success) {
      console.log(`    尝试使用 JPG 下载道具 ${itemId}`)
      success = await downloadFile(jpgUrl, jpgPath)
    }
  }
}

async function processSummoners() {
  console.log('获取召唤师列表...')
  const summonerList = await fetchJson(SUMMONER_LIST_URL)
  await fs.outputJson(path.join(DATA_DIR, 'summoner/list.json'), summonerList, {
    spaces: 2,
  })

  const totalSummoners = summonerList.length
  let currentSummoner = 0

  for (const sum of summonerList) {
    currentSummoner++
    const sumId = sum.summoner_id
    const pngPath = path.join(DATA_DIR, `summoner/${sumId}.png`)
    const jpgPath = path.join(DATA_DIR, `summoner/${sumId}.jpg`)

    if ((await fs.pathExists(pngPath)) || (await fs.pathExists(jpgPath))) {
      // console.log(`Skipping summoner ${sumId} - image already exists`);
      continue
    }

    console.log(
      `[${currentSummoner}/${totalSummoners}] 处理召唤师: ${sum.summoner_name} (${sumId})`,
    )
    const pngUrl = `https://game.gtimg.cn/images/yxzj/img201606/summonero/${sumId}.png`
    const jpgUrl = `https://game.gtimg.cn/images/yxzj/img201606/summonero/${sumId}.jpg`

    let success = await downloadFile(pngUrl, pngPath)
    if (!success) {
      console.log(`    尝试使用 JPG 下载召唤师 ${sumId}`)
      success = await downloadFile(jpgUrl, jpgPath)
    }
  }
}

async function convertDirectoryImages(dirName: string, outputFileName: string) {
  const sourceDir = path.join(DATA_DIR, dirName)
  const outputFile = path.join(DATA_DIR, outputFileName)

  console.log(`\n正在将 ${dirName} 中的图片转换为 ${outputFileName}...`)

  if (!(await fs.pathExists(sourceDir))) {
    console.log(`目录 ${dirName} 不存在，跳过。`)
    return
  }

  const files = await fs.readdir(sourceDir)
  const images: Record<string, string> = {}
  let count = 0

  for (const file of files) {
    // 仅处理图片文件，忽略 JSON 和其他目录
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue

    const filePath = path.join(sourceDir, file)
    try {
      const buffer = await fs.readFile(filePath)
      const ext = path.extname(file).toLowerCase().substring(1) // 移除点号
      const mimeType = ext === 'jpg' ? 'jpeg' : ext
      const base64 = `data:image/${mimeType};base64,${buffer.toString('base64')}`

      // 使用不带扩展名的文件名作为键 (例如: "105.jpg" -> "105")
      const key = path.parse(file).name
      images[key] = base64
      count++
    } catch (err) {
      console.error(`读取/转换文件失败 ${file}:`, err)
    }
  }

  await fs.outputJson(outputFile, images)
  console.log(`已保存 ${count} 张图片到 ${outputFileName}`)
}

async function main() {
  try {
    await processHeroes()
    if (!process.argv[2]) {
      await processItems()
      await processSummoners()
    }

    // 更新完数据后执行图片转换为 Base64，以确保每次都有最新图片被转换
    await convertDirectoryImages('hero', 'hero_images.json')
    if (!process.argv[2]) {
      await convertDirectoryImages('item', 'item_images.json')
      await convertDirectoryImages('summoner', 'summoner_images.json')
    }

    console.log('\n更新及转换完成！')
  } catch (error) {
    console.error('致命错误:', error)
    process.exit(1)
  }
}

main()
