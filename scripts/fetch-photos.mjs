/* 抓飞机照片（planespotters.net 公开照片 API），生成 js/photos-auto.js
   用法：node scripts/fetch-photos.mjs

   说明：planespotters 的照片是摄影师作品，他们的公开 API 允许网站嵌入并展示署名，
   所以每条都带上 photographer 和原始链接，页面上要显示出来。
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "js/photos-auto.js");
const ORIGIN = "https://flight-club.pages.dev";

/* 注册号 → 机型。挑的是各机型里还在飞、照片多的代表机。 */
const SUBJECTS = [
  // A350
  ["B-18901", "A350-941", "中华航空"],
  ["D-AIXK", "A350-941", "汉莎航空"],
  ["VH-ZND", "A350-941", "澳洲航空"],
  ["9V-SMA", "A350-941", "新加坡航空"],
  ["A7-ALA", "A350-941", "卡塔尔航空"],
  ["ET-ATQ", "A350-941", "埃塞俄比亚航空"],
  ["B-LRA", "A350-1041", "国泰航空"],
  // A320
  ["B-6382", "A320-214", "中国东方航空"],
  ["D-AIZC", "A320-214", "汉莎航空"],
  ["G-EUYO", "A320-232", "英国航空"],
  ["HK-4501", "A320-214", "哥伦比亚航空"],
  // MD-11F
  ["N525FE", "MD-11F", "联邦快递"],
  ["N250UP", "MD-11F", "UPS"],
  ["N602FE", "MD-11F", "联邦快递"],
  // B777
  ["B-16701", "777-35EER", "长荣航空"],
  ["N501DN", "777-232LR", "达美航空"],
  ["9V-SWQ", "777-312ER", "新加坡航空"],
  ["A6-EBN", "777-31HER", "阿联酋航空"],
  ["B-2022", "777-39PER", "中国东方航空"],
  // B737-8
  ["B-1301", "737-8", "中国国际航空"],
  ["N27246", "737-8", "美国联合航空"],
  ["9M-MXA", "737-8", "马来西亚航空"],
  ["V8-BLJ", "737-8", "文莱皇家航空"],
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function photoFor(reg) {
  const res = await fetch(`https://api.planespotters.net/pub/photos/reg/${encodeURIComponent(reg)}`, {
    headers: { "user-agent": UA, origin: ORIGIN, referer: `${ORIGIN}/` },
  });
  if (!res.ok) return { reg, error: `HTTP ${res.status}` };
  const json = await res.json();
  const p = json.photos?.[0];
  if (!p) return { reg, error: "无照片" };
  return {
    reg,
    src: p.thumbnail_large?.src,
    photographer: p.photographer,
    link: p.link?.split("?")[0],
  };
}

const out = [];
for (const [reg, type, airline] of SUBJECTS) {
  try {
    const p = await photoFor(reg);
    if (p.error) {
      console.log(`跳过 ${reg} (${type})：${p.error}`);
    } else {
      out.push({ reg, type, airline, src: p.src, photographer: p.photographer, link: p.link });
      console.log(`OK   ${reg} ${type.padEnd(12)} ${p.photographer}`);
    }
  } catch (e) {
    console.log(`跳过 ${reg}：${e.message}`);
  }
  await sleep(400);
}

const header = `/* 由 scripts/fetch-photos.mjs 自动生成，不要手改。
   照片版权归各摄影师所有，来源 planespotters.net，可点击链接查看原图。 */
const PHOTOS_AUTO = `;

fs.writeFileSync(OUT, header + JSON.stringify(out, null, 2) + ";\n", "utf8");
console.log(`\n写入 ${path.relative(root, OUT)}：${out.length} 张照片`);
