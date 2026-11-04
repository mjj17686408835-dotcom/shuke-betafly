/**
 * 自动抓取 12 座精选机场的真实照片（Wikimedia Commons，免费、可商用）。
 *
 * 用法：
 *   node scripts/fetch-airport-photos.mjs              # 抓全部
 *   node scripts/fetch-airport-photos.mjs --only=ZULS  # 只抓一座
 *   node scripts/fetch-airport-photos.mjs --dry        # 只看会抓到什么，不落盘
 *
 * 说明：
 *   - 抓到的图存成 images/airports/{ICAO}.jpg，覆盖旧的卡片图。
 *   - 任何一步失败（接口超时、没有合格照片、下载失败）都会跳过这座机场，
 *     旧图原样保留，不会把页面搞坏。
 *   - 只在 GitHub Actions 里跑得通；本地网络到不了 commons.wikimedia.org。
 *     想本地验证就 `GH_TOKEN=xxx node scripts/fetch-airport-photos.mjs --dry`，
 *     接口本身是公开的，通了就能跑。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "images", "airports");
mkdirSync(OUT, { recursive: true });

/* 机场 -> 维基条目名（搜索用） */
const TARGETS = [
  { icao: "ZULS", q: "Lhasa Gonggar Airport" },
  { icao: "VQPR", q: "Paro International Airport" },
  { icao: "LOWI", q: "Innsbruck Airport" },
  { icao: "LXGB", q: "Gibraltar International Airport" },
  { icao: "KSEZ", q: "Sedona Airport" },
  { icao: "KASE", q: "Aspen–Pitkin County Airport" },
  { icao: "PAJN", q: "Juneau International Airport" },
  { icao: "VNKT", q: "Tribhuvan International Airport" },
  { icao: "NZQN", q: "Queenstown Airport" },
  { icao: "TNCM", q: "Princess Juliana International Airport" },
  { icao: "LPMA", q: "Madeira Airport" },
  { icao: "LFLJ", q: "Courchevel Altiport" },
];

/* 这些词出现在文件名里，说明不是机场实景照 */
const BAD = /map|logo|diagram|chart|plan(?!e)|locator|symbol|icon|badge|crest|coat|seal|svg|flag|terminal ?layout|airport ?layout|runway ?diagram/i;

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const dry = args.includes("--dry");
const THUMB_W = 1600;

function apiUrl(q) {
  const p = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${q} airport`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime",
    iiurlwidth: String(THUMB_W),
    format: "json",
    origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${p}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pickPhoto(q, icao) {
  const res = await fetch(apiUrl(q), {
    headers: { "user-agent": "shuke-beita-flight-site/1.0 (scenery index)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {});
  if (!pages.length) return null;

  const candidates = pages
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      return {
        title: p.title || "",
        url: info.thumburl || info.url,
        width: info.width || 0,
        mime: info.mime || "",
      };
    })
    .filter(
      (c) =>
        c &&
        c.url &&
        c.mime === "image/jpeg" &&
        c.width >= 1000 &&
        !BAD.test(c.title) &&
        !BAD.test(c.url) &&
        !c.title.toUpperCase().includes(`-${icao}`) // 排除别的机场的图
    );

  if (!candidates.length) return null;

  /* 文件名里带机场名/城市的优先 */
  const words = q.toLowerCase().split(/[\s-]+/).filter((w) => w.length > 3);
  candidates.sort((a, b) => {
    const hit = (c) => words.filter((w) => c.title.toLowerCase().includes(w)).length;
    return hit(b) - hit(a) || b.width - a.width;
  });
  return candidates[0];
}

const list = only ? TARGETS.filter((t) => t.icao === only) : TARGETS;
let okCount = 0;
let skipCount = 0;

for (const { icao, q } of list) {
  try {
    const pick = await pickPhoto(q, icao);
    if (!pick) {
      console.log(`跳过 ${icao}：没有合格照片`);
      skipCount++;
      continue;
    }
    if (dry) {
      console.log(`[dry] ${icao} -> ${pick.title} (${pick.width}px) ${pick.url}`);
      okCount++;
      continue;
    }
    const img = await fetch(pick.url, {
      headers: { "user-agent": "shuke-beita-flight-site/1.0 (scenery index)" },
    });
    if (!img.ok) throw new Error(`下载失败 HTTP ${img.status}`);
    const buf = Buffer.from(await img.arrayBuffer());
    if (buf.length < 20 * 1024) throw new Error(`文件太小 ${buf.length}B，可能是占位图`);
    writeFileSync(join(OUT, `${icao}.jpg`), buf);
    console.log(`${icao}: ${Math.round(buf.length / 1024)} KB  ← ${pick.title}`);
    okCount++;
  } catch (err) {
    console.log(`跳过 ${icao}：${err.message}`);
    skipCount++;
  }
  await sleep(600); // 别把 Commons 打急了
}

console.log(`\n完成：更新 ${okCount} 座，跳过 ${skipCount} 座`);
if (skipCount && okCount === 0) process.exitCode = 1;
