# 临时：打包可上传到 GitHub 的 zip（条目用正斜杠，跨平台都能正常解压）
import os
import sys
import zipfile
from pathlib import Path

root = Path(sys.argv[1])
out = Path(sys.argv[2])

EXCLUDE_DIRS = {root / "images" / "pool"}
EXCLUDE_FILES = {"shot-cards.png", "shot-lower.png", "shot-search-global.png"}

count = 0
total = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(root)
        if path.name in EXCLUDE_FILES:
            continue
        if any(part == "__pycache__" for part in rel.parts):
            continue
        if (root / "images" / "pool") in path.parents:
            continue
        arc = rel.as_posix()
        z.write(path, arc)
        count += 1
        total += path.stat().st_size

print(f"打包 {count} 个文件 / 原始 {total/1024/1024:.2f} MB -> {out.name} {out.stat().st_size/1024/1024:.2f} MB")
