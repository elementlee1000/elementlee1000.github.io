import os, json, sys

exts = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def scan(folder):
    path = f"images/{folder}"
    files = sorted(f for f in os.listdir(path) if f.lower().endswith(exts))
    with open(f"{path}/manifest.json", "w") as f:
        json.dump({"images": files}, f, indent=2)
    print(f"OK: {len(files)} images -> {path}/manifest.json")

# 指定文件夹：python scan_images.py cave-network
# 扫描全部：python scan_images.py
if len(sys.argv) > 1:
    scan(sys.argv[1])
else:
    for folder in os.listdir("images"):
        if os.path.isdir(f"images/{folder}"):
            scan(folder)
