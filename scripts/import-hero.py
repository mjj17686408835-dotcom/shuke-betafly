# 把玩家自己的 MSFS 截图导入成首屏背景图：
# 裁掉上下 3%（去掉 HUD/任务栏/鼠标残影），缩到 1920 宽，压缩到 q82，输出 images/hero/NN.jpg
import os
import glob
from PIL import Image

SRC = r"C:\Users\Administrator\Pictures\Camera Roll\2537590\screenshots"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "images", "hero")
os.makedirs(OUT, exist_ok=True)

files = sorted(glob.glob(os.path.join(SRC, "*.jpg")))
if not files:
    raise SystemExit("源目录没有 jpg")

for i, f in enumerate(files, 1):
    im = Image.open(f).convert("RGB")
    w, h = im.size
    top = int(h * 0.03)
    bottom = h - int(h * 0.03)
    im = im.crop((0, top, w, bottom))
    if im.width > 1920:
        im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
    dest = os.path.join(OUT, f"hero-{i:02d}.jpg")
    im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{os.path.basename(f)} -> hero-{i:02d}.jpg {im.size} {os.path.getsize(dest)//1024} KB")

print(f"共 {len(files)} 张，输出到 {os.path.abspath(OUT)}")
