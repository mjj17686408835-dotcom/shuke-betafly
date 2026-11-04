/* 给当天的三个方案各配一张图：
   1) 已有该机场实景图（images/airports/{ICAO}.jpg）→ 直接用
   2) 试着从 Wikimedia Commons 抓一张（宽度 ≥1600），抓到就下载到 images/picks/{ICAO}.jpg
   3) 都失败 → 按机场特征配主题图（mountain / island / desert / city / cold / airfield）
   最后把 photo 字段写回 js/today-auto.js，并打印结果。
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const todayPath = join(root, "js/today-auto.js");

const code = readFileSync(todayPath, "utf8");
const TODAY = new Function(`${code}\nreturn TODAY_AUTO;`)();

/* 按日期分目录存：images/picks/2026-11-04/EKCH.jpg
   这样「只保留最近 30 天」只要按目录名删老的就行 */
const DAY = TODAY.date || new Date().toISOString().slice(0, 10);
const picksDir = join(root, "images/picks", DAY);
mkdirSync(picksDir, { recursive: true });
const UA = "shuke-betafly/1.0 (+static site; MSFS group site)";

/* 主题图：从 images/pool 里按机场特征挑，保证宽度 2560 */
const THEME = {
  island: "images/pool/pexels-36553184.jpg",
  coast: "images/pool/pexels-36553184.jpg",
  mountain: "images/pool/pexels-35778731.jpg",
  high: "images/pool/pexels-34770676.jpg",
  desert: "images/pool/pexels-34637700.jpg",
  canyon: "images/pool/pexels-34637700.jpg",
  cold: "images/pool/pexels-33883156.jpg",
  city: "images/pool/pexels-35130117.jpg",
  hub: "images/pool/pexels-31519545.jpg",
  airfield: "images/pexels-32272750.jpg",
};

function themeTag(p) {
  const name = `${p.name || ""} ${p.city || ""}`.toLowerCase();
  if (/island|beach|bay|coast|harbour|harbor|reef|lagoon|atoll/.test(name)) return "island";
  if (/glacier|arctic|ice|nord|polar|fjord/.test(name) || Math.abs(p.lat || 0) > 58) return "cold";
  if (p.elev >= 2000) return "high";
  if (/mountain|peak|valley|alps|andes|plateau/.test(name)) return "mountain";
  if (/desert|canyon|dune|savanna|steppe/.test(name)) return "desert";
  if (p.rwy >= 3000) return "hub";
  return "airfield";
}

function pickIcao(p) {
  return p.icao;
}

async function commonsPhoto(p) {
  const q = encodeURIComponent(`${p.icao} ${p.name || ""}`.trim());
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${q}&gsrnamespace=6&gsrlimit=8` +
    "&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json&origin=*";
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const pages = Object.values(j?.query?.pages || {});
  const BAD = /(map|logo|diagram|chart|locator|symbol|icon|badge|crest|coat|seal|flag|layout|plan)/i;
  const good = pages
    .map((x) => ({ t: x.title, ii: x.imageinfo?.[0] }))
    .filter((x) => x.ii && x.ii.mime === "image/jpeg" && x.ii.width >= MIN_W && !BAD.test(x.t))
    .sort((a, b) => b.ii.width - a.ii.width);
  return good[0]?.ii?.thumburl || good[0]?.ii?.url || null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 20000) throw new Error(`文件太小 ${buf.length}B`);
  writeFileSync(dest, buf);
  return buf.length;
}

for (const p of TODAY.picks) {
  const icao = pickIcao(p);
  const dest = join(picksDir, `${icao}.jpg`);
  const localCard = join(root, "images/airports", `${icao}.jpg`);

  if (existsSync(localCard)) {
    p.photo = `images/airports/${icao}.jpg`;
    console.log(`  ${icao} 用已有实景图`);
    continue;
  }
  if (existsSync(dest) && !process.argv.includes("--force")) {
    p.photo = `images/picks/${DAY}/${icao}.jpg`;
    console.log(`  ${icao} 已有缓存图`);
    continue;
  }
  try {
    const u = await commonsPhoto(p);
    if (!u) throw new Error("commons 没有合适图片");
    const n = await download(u, dest);
    p.photo = `images/picks/${DAY}/${icao}.jpg`;
    console.log(`  ${icao} Wikimedia 抓到 ${Math.round(n / 1024)} KB`);
  } catch (e) {
    const tag = themeTag(p);
    const src = join(root, THEME[tag]);
    copyFileSync(src, dest);
    p.photo = `images/picks/${DAY}/${icao}.jpg`;
    console.log(`  ${icao} 退回主题图 ${tag}（${e.message}）`);
  }
  await new Promise((r) => setTimeout(r, 400));
}

const head = code.slice(0, code.indexOf("const TODAY_AUTO"));
const out = `${head}const TODAY_AUTO = ${JSON.stringify(TODAY, null, 2)};\n`;
writeFileSync(todayPath, out, "utf8");
console.log(`已写回 ${picksDir} 与 js/today-auto.js`);
