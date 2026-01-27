import os
import json
import requests
from concurrent.futures import ThreadPoolExecutor

def download_one(item, save_dir):
    item_id = item.get("item_id")
    item_name = item.get("item_name", "未知")
    
    if not item_id:
        return

    # 1. 模拟真实浏览器的请求头
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pvp.qq.com/",  # 模拟从官网跳转过来
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }

    # 2. 拼接地址 (尝试 .png, 如果还是不行可以考虑换成 .jpg)
    img_url = f"https://game.gtimg.cn/images/yxzj/img201606/itemimg/{item_id}.png"
    save_path = os.path.join(save_dir, f"{item_id}.png")

    try:
        # 添加 headers 参数
        response = requests.get(img_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"✅ 下载成功: {item_id} ({item_name})")
        elif response.status_code == 404:
            # 如果 png 不存在，尝试下载 jpg (王者荣耀部分资源是 jpg)
            img_url_jpg = img_url.replace(".png", ".jpg")
            response_jpg = requests.get(img_url_jpg, headers=headers, timeout=15)
            if response_jpg.status_code == 200:
                with open(save_path.replace(".png", ".jpg"), 'wb') as f:
                    f.write(response_jpg.content)
                print(f"✅ 下载成功(JPG): {item_id} ({item_name})")
            else:
                print(f"❌ 资源不存在 (404): {item_id}")
        else:
            print(f"🚫 拒绝访问 (HTTP {response.status_code}): {item_id}")
            
    except Exception as e:
        print(f"⚠️ 异常 {item_id}: {e}")

def main():
    json_path = "./item.json"
    save_dir = "./images"

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            items = json.load(f)
    except Exception as e:
        print(f"读取 JSON 失败: {e}")
        return

    print(f"🚀 开始模拟浏览器环境下载，共计 {len(items)} 个项目...")

    # 稍微降低并发，避免被识别为攻击
    with ThreadPoolExecutor(max_workers=5) as executor:
        for item in items:
            executor.submit(download_one, item, save_dir)

    print("\n✨ 任务处理完毕！")

if __name__ == "__main__":
    main()
