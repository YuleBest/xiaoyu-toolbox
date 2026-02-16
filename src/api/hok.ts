import request from "./request";

const API_BASE = "https://hok.api.yule.ink";

export interface Hero {
  ename: number;
  cname: string;
  title: string;
  id_name: string;
  hero_type: number;
  hero_type2?: number;
  skin_name?: string;
  // Detail fields (loaded on demand)
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
  const { data } = await request.get<Hero[]>(`${API_BASE}/hero_list`);
  return data;
}

/**
 * 获取英雄图片映射
 */
export async function getHeroImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_BASE}/hero_images`,
  );
  return data;
}

/**
 * 获取装备列表
 */
export async function getItemList(): Promise<GameItem[]> {
  const { data } = await request.get<GameItem[]>(`${API_BASE}/item_list`);
  return data;
}

/**
 * 获取装备图片映射
 */
export async function getItemImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_BASE}/item_images`,
  );
  return data;
}

/**
 * 获取召唤师技能列表
 */
export async function getSummonerList(): Promise<SummonerSkill[]> {
  const { data } = await request.get<SummonerSkill[]>(
    `${API_BASE}/summoner_list`,
  );
  return data;
}

/**
 * 获取召唤师技能图片映射
 */
export async function getSummonerImages(): Promise<Record<string, string>> {
  const { data } = await request.get<Record<string, string>>(
    `${API_BASE}/summoner_images`,
  );
  return data;
}

/**
 * 获取英雄详情（技能、皮肤、属性）
 */
export async function getHeroDetail(ename: number): Promise<Partial<Hero>> {
  const { data } = await request.get<Partial<Hero>>(`${API_BASE}/${ename}`);
  return data;
}
