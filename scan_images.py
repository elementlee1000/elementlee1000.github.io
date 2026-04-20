import os, json, sys

folder = sys.argv[1] if len(sys.argv) > 1 else "cave-network"
path = f"images/{folder}"
exts = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

files = sorted(f for f in os.listdir(path) if f.lower().endswith(exts))

with open(f"{path}/manifest.json", "w") as f:
    json.dump({"images": files}, f, indent=2)

print(f"OK: {len(files)} images -> {path}/manifest.json")
