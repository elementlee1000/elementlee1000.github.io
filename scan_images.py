import os, json

EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def scan():
    artworks_dir = os.path.join("images", "Artworks")
    artworks = []

    for folder in sorted(os.listdir(artworks_dir)):
        folder_path = os.path.join(artworks_dir, folder)
        if not os.path.isdir(folder_path):
            continue

        files = sorted(f for f in os.listdir(folder_path) if f.lower().endswith(EXTS))
        if not files:
            print(f"  SKIP {folder}: no images")
            continue

        # 写子文件夹 manifest.json
        with open(os.path.join(folder_path, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump({"images": files}, f, indent=2, ensure_ascii=False)

        # 读 info.json（可选）覆盖标题/描述
        title = folder  # 文件夹名直接作为标题
        title_zh = ""   # 中文标题（站点切换中文时使用，留空则回退英文）
        description = ""
        description_zh = ""
        info_path = os.path.join(folder_path, "info.json")
        if os.path.exists(info_path):
            with open(info_path, encoding="utf-8") as f:
                info = json.load(f)
                if info.get("title"):
                    title = info["title"]
                if info.get("title_zh"):
                    title_zh = info["title_zh"]
                if info.get("description"):
                    description = info["description"]
                if info.get("description_zh"):
                    description_zh = info["description_zh"]

        artworks.append({
            "folder": folder,
            "title": title,
            "title_zh": title_zh,
            "description": description,
            "description_zh": description_zh,
            "images": files
        })
        print(f"  {folder}: {len(files)} images")

    # 写 images/Artworks/manifest.json
    out = os.path.join(artworks_dir, "manifest.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"artworks": artworks}, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {out}  ({len(artworks)} artworks)")

if __name__ == "__main__":
    scan()
