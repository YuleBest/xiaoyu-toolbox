/**
 * HOK API - 从本地静态文件读取数据
 * 数据来源：/public/database/hok/
 */

const DB = '/database/hok'

export interface Hero {
  ename: number
  cname: string
  title: string
  id_name: string
  hero_type: number
  hero_type2?: number
  skin_name?: string
  skills?: HeroSkill[]
  skins?: { name: string; id?: string }[]
  attributes?: Record<string, string | number>
  occupation?: string
}

export interface HeroSkill {
  name: string
  description: string
  tips?: string
  cooldownAttributes?: string
  info?: string
  icon?: string
}

export interface GameItem {
  item_id: number
  item_name: string
  item_type: number
  total_price: number
  des1: string
  des2?: string
}

export interface SummonerSkill {
  summoner_id: number
  summoner_name: string
  summoner_description: string
  summoner_rank: string
}

/**
 * 获取所有英雄列表
 */
export async function getHeroList(): Promise<Hero[]> {
  const res = await fetch(`${DB}/hero/list.json`)
  return res.json()
}

/**
 * 获取英雄图片映射（ename → 本地路径）
 * 不再依赖 hero_images.json，直接构造路径
 */
export async function getHeroImages(): Promise<Record<string, string>> {
  const heroes = await getHeroList()
  const map: Record<string, string> = {}
  for (const h of heroes) {
    map[String(h.ename)] = `${DB}/hero/${h.ename}.jpg`
  }
  return map
}

/**
 * 直接根据 ename 返回头像路径
 */
export function getHeroImageUrl(ename: number): string {
  return `${DB}/hero/${ename}.jpg`
}

/**
 * 获取装备列表
 */
export async function getItemList(): Promise<GameItem[]> {
  const res = await fetch(`${DB}/item/list.json`)
  return res.json()
}

/**
 * 获取装备图片映射（item_id → 本地路径）
 */
export async function getItemImages(): Promise<Record<string, string>> {
  const items = await getItemList()
  const map: Record<string, string> = {}
  for (const item of items) {
    map[String(item.item_id)] = `${DB}/item/${item.item_id}.png`
  }
  return map
}

/**
 * 获取召唤师技能列表
 */
export async function getSummonerList(): Promise<SummonerSkill[]> {
  const res = await fetch(`${DB}/summoner/list.json`)
  return res.json()
}

/**
 * 获取召唤师技能图片映射（summoner_id → 本地路径）
 */
export async function getSummonerImages(): Promise<Record<string, string>> {
  const summoners = await getSummonerList()
  const map: Record<string, string> = {}
  for (const s of summoners) {
    map[String(s.summoner_id)] = `${DB}/summoner/${s.summoner_id}.png`
  }
  return map
}

/**
 * 获取英雄详情（包含技能、皮肤、属性）
 */
export async function getHeroDetail(ename: number): Promise<Partial<Hero>> {
  const res = await fetch(`${DB}/hero/${ename}.json`)
  return res.json()
}
