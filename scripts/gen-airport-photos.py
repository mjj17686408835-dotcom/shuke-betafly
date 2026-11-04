"""给候选池里的机场裁出 4:3 卡片图（900x675），源图是 Pexels 的航空/风景照。"""
import os
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images")
OUT = os.path.join(SRC, "airports")
os.makedirs(OUT, exist_ok=True)

TARGET_W, TARGET_H = 900, 675

# icao, 源文件（相对 images/）, 裁剪焦点, 亮度倍数（窗景类偏暗，拉回来）
# 规则：12 座机场必须 12 张不同的源图，下面有断言兜底
PLAN = [
    ("ZULS", "pool/pexels-30939989.jpg", "right", 1.2),    # 航站楼窗景 + 雪山停机坪
    ("VNKT", "pool/pexels-35778731.jpg", "center", 1.06),  # 客机下降 + 群山
    ("VQPR", "pool/pexels-34770676.jpg", "center", 1.05),  # 山谷跑道
    ("LOWI", "pexels-34050152.jpg", "top", 1.0),           # 云海之上的机翼
    ("LXGB", "pexels-32272750.jpg", "center", 1.0),        # 黄昏跑道进近
    ("KSEZ", "pool/pexels-34637700.jpg", "center", 1.0),   # 红岩峡谷
    ("KASE", "pool/pexels-32856523.jpg", "center", 1.12),  # 支线机 + 草场跑道
    ("PAJN", "pool/pexels-33883156.jpg", "center", 1.05),  # 冰川峡湾
    ("NZQN", "pool/pexels-35642573.jpg", "center", 1.0),   # 航拍云层
    ("TNCM", "pexels-38231890.jpg", "center", 1.0),        # 蓝天客机
    ("LPMA", "pool/pexels-36553184.jpg", "center", 1.0),   # 海岸跑道通向城镇
    ("LFLJ", "pexels-38203257.jpg", "center", 1.0),        # 停机坪客机
    ("ZBAA", "pool/pexels-31519545.jpg", "center", 1.1),   # 航站楼候机厅逆光
    ("ZSSS", "pool/pexels-34118486.jpg", "center", 1.08),  # 上海机场航站楼
    ("ZGGG", "pool/pexels-35130117.jpg", "center", 1.15),  # 江畔夜景天际线
    ("ZPPP", "pool/pexels-36907614.jpg", "center", 1.05),  # 喀斯特石林
    ("ZWWW", "pool/pexels-37450426.jpg", "center", 1.0),   # 金色山丘
]

_srcs = [p[1] for p in PLAN]
assert len(set(_srcs)) == len(_srcs), "有机场共用了同一张源图：" + str(
    [s for s in set(_srcs) if _srcs.count(s) > 1]
)


def crop_to(im, ratio, focus):
    w, h = im.size
    if w / h > ratio:
        new_w = int(h * ratio)
        x = 0 if focus == "left" else (w - new_w if focus == "right" else (w - new_w) // 2)
        return im.crop((x, 0, x + new_w, h))
    new_h = int(w / ratio)
    y = 0 if focus == "top" else (h - new_h if focus == "bottom" else (h - new_h) // 2)
    return im.crop((0, y, w, y + new_h))


ratio = TARGET_W / TARGET_H
for icao, rel, focus, bright in PLAN:
    path = os.path.join(SRC, rel)
    im = Image.open(path).convert("RGB")
    im = crop_to(im, ratio, focus).resize((TARGET_W, TARGET_H), Image.LANCZOS)
    if bright != 1.0:
        im = ImageEnhance.Brightness(im).enhance(bright)
        im = ImageEnhance.Contrast(im).enhance(1.05)
    out = os.path.join(OUT, f"{icao}.jpg")
    im.save(out, quality=82, optimize=True)
    print(f"{icao}: {os.path.getsize(out) // 1024} KB  {im.size}")
