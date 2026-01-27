import os
import json
import requests
from concurrent.futures import ThreadPoolExecutor

def download_hero_image(hero, save_dir):
    ename = hero.get("ename")
    cname = hero.get("cname", "未知")
    
    if not ename:
        return

    # 1. 拼接图片地址
    # 格式：https://game.gtimg.cn/images/yxzj/img201606/heroimg/105/105.jpg
    img_url = f"https://game.gtimg.cn/images/yxzj/img201606/heroimg/{ename}/{ename}.jpg"
    
    # 2. 设定保存文件名 (例如: 105_廉颇.jpg)
    save_path = os.path.join(save_dir, f"{ename}_{cname}.jpg")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pvp.qq.com/"
    }

    try:
        response = requests.get(img_url, headers=headers, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"✅ 下载成功: {cname} ({ename})")
        else:
            print(f"❌ 资源未找到 (HTTP {response.status_code}): {cname}")
    except Exception as e:
        print(f"⚠️ 异常 {cname}: {e}")

def main():
    json_path = "./data.json"  # 你的JSON文件名
    save_dir = "./hero_heads"

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            heroes = json.load(f)
    except Exception as e:
        print(f"读取 JSON 失败: {e}")
        return

    print(f"🚀 开始下载英雄头像，共 {len(heroes)} 个...")

    # 使用5个线程并发下载
    with ThreadPoolExecutor(max_workers=5) as executor:
        for hero in heroes:
            executor.submit(download_hero_image, hero, save_dir)

    print("\n✨ 所有头像下载完成！")

if __name__ == "__main__":
    main()
