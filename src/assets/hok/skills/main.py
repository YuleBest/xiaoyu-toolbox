import os
import json
import requests

def download_summoner_skills():
    # 配置
    json_url = "https://pvp.qq.com/web201605/js/summoner.json"
    img_base_url = "https://game.gtimg.cn/images/yxzj/img201606/summonero/"
    save_dir = "./summoner_skills"
    
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pvp.qq.com/web201605/summoner.shtml"
    }

    try:
        print("正在获取召唤师技能列表...")
        response = requests.get(json_url, headers=headers)
        response.encoding = 'utf-8' # 或者 gbk，取决于服务器返回
        skills_data = response.json()

        # 保存文本信息
        with open("summoners_data.json", "w", encoding="utf-8") as f:
            json.dump(skills_data, f, ensure_ascii=False, indent=4)
        
        print(f"共发现 {len(skills_data)} 个技能，开始下载图片...")

        for skill in skills_data:
            s_id = skill.get("summoner_id")
            s_name = skill.get("summoner_name")
            
            # 拼接图片地址 (根据 HTML 里的逻辑使用 .png)
            img_url = f"{img_base_url}{s_id}.png"
            img_path = os.path.join(save_dir, f"{s_id}_{s_name}.png")

            try:
                img_res = requests.get(img_url, headers=headers, timeout=10)
                if img_res.status_code == 200:
                    with open(img_path, 'wb') as f:
                        f.write(img_res.content)
                    print(f"✅ 已保存: {s_name}")
                else:
                    # 备选方案：尝试 .jpg
                    img_url_jpg = img_url.replace(".png", ".jpg")
                    img_res_jpg = requests.get(img_url_jpg, headers=headers)
                    if img_res_jpg.status_code == 200:
                        with open(img_path.replace(".png", ".jpg"), 'wb') as f:
                            f.write(img_res_jpg.content)
                        print(f"✅ 已保存(JPG): {s_name}")
            except Exception as e:
                print(f"⚠️ 下载图片 {s_name} 出错: {e}")

        print("\n✨ 召唤师技能处理完毕！图片存放在 ./summoner_skills 目录。")

    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    download_summoner_skills()
