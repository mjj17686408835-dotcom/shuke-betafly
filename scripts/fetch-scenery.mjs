/* =========================================================
   抓取 SceneryAddons 的 MSFS 2024 机场地景列表
   用法：node scripts/fetch-scenery.mjs [--pages=3]

   输出 js/scenery-auto.js（浏览器可直接 <script> 引入）。
   只抓「标题 + 链接 + 版本 + 发布日期」，不下载任何文件。
   ========================================================= */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://sceneryaddons.org/category/msfs-airport/";

const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const PAGES = pagesArg ? Math.max(1, parseInt(pagesArg.split("=")[1], 10)) : 3;

/* 4 字母但不是机场代码的词，需要排除 */
const NOT_ICAO = new Set(["MSFS", "VDGS", "PAPI", "ILSX", "STAR", "SIDX"]);

function pageUrl(n) {
  return n === 1 ? BASE : `${BASE}page/${n}/`;
}

function stripTags(s) {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

function pickIcao(title) {
  const candidates = title.match(/\b[A-Z]{4}\b/g) || [];
  for (const c of candidates) {
    if (NOT_ICAO.has(c)) continue;
    return c;
  }
  return null;
}

function parseArticles(html) {
  const blocks = html.match(/<article id="post-[\s\S]*?<\/article>/g) || [];
  const out = [];

  for (const block of blocks) {
    if (!block.includes("category-msfs-2024")) continue;

    const hrefM = block.match(
      /<h2 class="blog-entry-title entry-title"><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/
    );
    if (!hrefM) continue;

    const url = hrefM[1];
    const rawTitle = hrefM[2].replace(/<div class="scad-title-suffix-comp">[\s\S]*?<\/div>/g, "");
    const title = stripTags(rawTitle);

    const dateM = block.match(/<time class="entry-date published" datetime="([^"]+)"/);
    const thumbM = block.match(/<img[^>]+src="([^"]+)"/);

    const versionM = title.match(/\bv\d+(?:\.\d+)*\b/i);
    const parts = title.split(/\s+[–—-]\s+/).map((s) => s.trim());
    const author = parts.length > 1 ? parts[0] : "";
    const icao = pickIcao(title);

    out.push({
      airport: icao || "",
      title: title.replace(/\s*v\d+(?:\.\d+)*\s*$/i, "").replace(/\s*MSFS 2024\s*$/i, "").trim(),
      author,
      version: versionM ? versionM[0] : "",
      date: dateM ? dateM[1].slice(0, 10) : "",
      thumb: thumbM ? thumbM[1] : "",
      url,
    });
  }
  return out;
}

async function main() {
  const seen = new Map();

  for (let n = 1; n <= PAGES; n++) {
    const url = pageUrl(n);
    process.stdout.write(`抓取 ${url} ... `);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "flight-club-scenery-index/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) {
        console.log(`HTTP ${res.status}，跳过`);
        continue;
      }
      const html = await res.text();
      const items = parseArticles(html);
      for (const it of items) {
        if (!seen.has(it.url)) seen.set(it.url, it);
      }
      console.log(`${items.length} 条`);
    } catch (err) {
      console.log(`失败：${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  const list = [...seen.values()].sort((a, b) => (a.date < b.date ? 1 : -1));

  const body =
    "/* 由 scripts/fetch-scenery.mjs 自动生成，请勿手改。\n" +
    `   抓取时间：${new Date().toISOString()}\n` +
    `   条目数：${list.length} */\n` +
    "const SCENERY_AUTO = " +
    JSON.stringify(list, null, 2) +
    ";\n";

  const outFile = path.join(root, "js/scenery-auto.js");
  fs.writeFileSync(outFile, body, "utf8");

  console.log(`\n写入 ${outFile}`);
  console.log(`共 ${list.length} 条，其中带 ICAO 的 ${list.filter((x) => x.airport).length} 条`);
  const sample = list.slice(0, 3);
  for (const s of sample) console.log(`  ${s.airport || "----"}  ${s.title}  ${s.version}`);
}

main();
