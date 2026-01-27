import os
import json
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

# 模拟浏览器请求头
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://pvp.qq.com/"
}

def parse_hero_detail(html_content):
    """解析 HTML 提取英雄详细数据"""
    soup = BeautifulSoup(html_content, 'html.parser')
    data = {}

    # 1. 基础信息
    data['title'] = soup.select_one('.hero-title').get_text(strip=True) if soup.select_one('.hero-title') else ""
    data['name'] = soup.select_one('.hero-name').get_text(strip=True) if soup.select_one('.hero-name') else ""
    
    # 2. 英雄属性 (生存, 攻击, 技能, 难度)
    # 这里的数值通常隐藏在 class 的末尾数字中，例如 hero-attr1-7 代表 7
    attrs = {}
    attr_names = ['生存', '攻击', '技能', '难度']
    for i, name in enumerate(attr_names, 1):
        target = soup.select_one(f'.hero-attr{i}')
        if target:
            # 提取 class 里的数字
            classes = target.get('class', [])
            val = [c.split('-')[-1] for c in classes if f'hero-attr{i}-' in c]
            attrs[name] = val[0] if val else "0"
    data['attributes'] = attrs

    # 3. 技能详情
    skills = []
    skill_names = soup.select('.plus-name')
    skill_values = soup.select('.plus-value')
    skill_desc = soup.select('.plus-int')
    skill_tips = soup.select('.prompt')

    for i in range(len(skill_names)):
        name = skill_names[i].get_text(strip=True)
        if not name: continue
        skills.append({
            "name": name,
            "info": skill_values[i].get_text(strip=True) if i < len(skill_values) else "",
            "description": skill_desc[i].get_text(strip=True) if i < len(skill_desc) else "",
            "tips": skill_tips[i].get_text(strip=True) if i < len(skill_tips) else ""
        })
    data['skills'] = skills

    # 4. 推荐装备 (从 data-item 属性中提取 ID 列表)
    builds = {}
    build_elements = soup.select('.equip-list')
    if len(build_elements) >= 2:
        builds['winning_build'] = build_elements[0].get('data-item', '').split('|')
        builds['losing_build'] = build_elements[1].get('data-item', '').split('|')
    data['recommended_builds'] = builds

    # 5. 铭文建议
    ming_data = soup.select_one('.rune-list')
    data['inscriptions'] = ming_data.get('data-ming', '').split('|') if ming_data else []

    # 6. 英雄关系
    relations = {}
    rel_titles = ['best_partners', 'restrained_by', 'restrains_who']
    rel_lists = soup.select('.rela-list')
    for i, title in enumerate(rel_titles):
        if i < len(rel_lists):
            items = []
            for li in rel_lists[i].select('li'):
                items.append({
                    "hero_id": li.select_one('img').get('data-src') if li.select_one('img') else "",
                    "reason": li.select_one('.rela-text').get_text(strip=True) if li.select_one('.rela-text') else ""
                })
            relations[title] = items
    data['relations'] = relations

    return data

def download_hero_detail(hero, save_dir):
    id_name = hero.get("id_name")
    if not id_name: return

    url = f"https://pvp.qq.com/web201605/herodetail/m/{id_name}.html"
    save_path = os.path.join(save_dir, f"{id_name}.json")

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        # 腾讯官网移动端页面使用 GBK 编码
        response.encoding = 'gbk' 
        
        if response.status_code == 200:
            hero_data = parse_hero_detail(response.text)
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(hero_data, f, ensure_ascii=False, indent=4)
            print(f"✅ 已抓取: {id_name} ({hero_data.get('name')})")
        else:
            print(f"❌ 请求失败 {id_name}: {response.status_code}")
    except Exception as e:
        print(f"⚠️ 异常 {id_name}: {e}")

def main():
    json_path = "./herolist.json"
    save_dir = "./hero_details"

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    with open(json_path, 'r', encoding='utf-8') as f:
        heroes = json.load(f)

    print(f"开始爬取英雄详情，共 {len(heroes)} 个...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        for hero in heroes:
            executor.submit(download_hero_detail, hero, save_dir)

if __name__ == "__main__":
    main()
