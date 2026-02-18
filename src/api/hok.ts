import request from "./request";

/**
 * 对应后端路径：functions/api/hok/[key].ts
 * 已经迁移到全栈模式，不再需要外部域名
 */
const API_PREFIX = "/api/hok";

export interface Hero {
  ename: number;
  cname: string;
  title: string;
  id_name: string;
  hero_type: number;
  hero_type2?: number;
  skin_name?: string;
  skills?: HeroSkill[];
  skins?: { name: string }[];
  attributes?: Record<string, number>;
}

export interface HeroSkill {
  name: string;
  description: string;
  tips?: string;
  cooldownAttributes?: string;
  info?: string;
}

export interface GameItem {
  item_id: number;
  item_name: string;
  item_type: number;
  total_price: number;
  des1: string;
  des2?: string;
}

export interface SummonerSkill {
  summoner_id: number;
  summoner_name: string;
  summoner_description: string;
  summoner_rank: string;
}

/**
 * 获取所有英雄列表
 */
export async function getHeroList(): Promise<Hero[]> {
  const { data } = await request.get<Hero[]>(`${API_PREFIX}/hero_list`);
  return data;
}

/**
 * 获取英雄图片映射
 */
export async function getHeroImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_PREFIX}/hero_images`,
  );
  return data;
}

/**
 * 获取装备列表
 */
export async function getItemList(): Promise<GameItem[]> {
  const { data } = await request.get<GameItem[]>(`${API_PREFIX}/item_list`);
  return data;
}

/**
 * 获取装备图片映射
 */
export async function getItemImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_PREFIX}/item_images`,
  );
  return data;
}

/**
 * 获取召唤师技能列表
 */
export async function getSummonerList(): Promise<SummonerSkill[]> {
  const { data } = await request.get<SummonerSkill[]>(
    `${API_PREFIX}/summoner_list`,
  );
  return data;
}

/**
 * 获取召唤师技能图片映射
 */
export async function getSummonerImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_PREFIX}/summoner_images`,
  );
  return data;
}

/**
 * 获取英雄详情（技能、皮肤、属性）
 * 后端 [key].ts 会自动匹配 ename 动态参数
 */
export async function getHeroDetail(ename: number): Promise<Partial<Hero>> {
  const { data } = await request.get<Partial<Hero>>(`${API_PREFIX}/${ename}`);
  return data;
}
