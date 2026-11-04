/* 开发用：无浏览器环境下跑一遍渲染逻辑，检查生成的 HTML。
   用法：node scripts/verify.mjs [--show=#某个容器]
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const store = new Map();

function makeEl(sel) {
  return {
    sel,
    innerHTML: "",
    textContent: "",
    value: "",
    style: { setProperty() {}, display: "" },
    classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
    dataset: {},
    addEventListener() {},
    closest() { return null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    scrollIntoView() {},
  };
}

const document = {
  querySelector(sel) {
    if (!store.has(sel)) store.set(sel, makeEl(sel));
    return store.get(sel);
  },
  querySelectorAll() { return []; },
  addEventListener(ev, fn) {
    if (ev === "DOMContentLoaded") globalThis.__boot = fn;
  },
};

const window = {
  scrollTo() {},
  scrollY: 0,
  addEventListener() {},
  removeEventListener() {},
};

const noTimer = () => ({ unref() {} });

const files = [
  "js/data.js",
  "js/airports-auto.js",
  "js/scenery-auto.js",
  "js/photos-auto.js",
  "js/backgrounds.js",
  "js/today-auto.js",
  "js/weather-auto.js",
  "js/app.js",
].filter((f) => fs.existsSync(path.join(root, f)));

const code = files.map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");

// eslint-disable-next-line no-new-func
new Function("document", "window", "setInterval", "setTimeout", code)(
  document,
  window,
  noTimer,
  noTimer
);

if (typeof globalThis.__boot !== "function") {
  console.error("FAIL: boot 未注册");
  process.exit(1);
}

globalThis.__boot();

const checks = [
  ["首屏标题", "#hero-title", ["hero-icao"]],
  ["首屏浮卡", "#hero-card", ["hc-facts", "hc-approach"]],
  ["首屏署名", "#hero-credit", ["Photo"]],
  ["背景层", "#bg-layer", ["<img"]],
  ["机场网格", "#airport-grid", ["airport-card", "ac-icao", "ac-go"]],
  ["机队卡", "#fleet", ["class=\"photo\"", "A350", "MD-11F"]],
  ["航线列表", "#route-list", ["route-path", "route-note"]],
  ["今日航线", "#today-routes-list", ["route-path"]],
  ["地景列表", "#scenery-list", ["scn-icao", "sceneryaddons.org"]],
  ["大洲筛选", "#airport-chips", ["data-region"]],
  ["机型筛选", "#aircraft-chips", ["data-fleet"]],
];

let failed = 0;

for (const [label, sel, needles] of checks) {
  const html = store.get(sel)?.innerHTML ?? "";
  const missing = needles.filter((n) => !html.includes(n));
  const count = (html.match(/class="(plane|route|scn|airport-card)"/g) || []).length;
  if (missing.length) {
    console.log(`FAIL ${label} (${sel}) 缺少: ${missing.join(", ")}`);
    failed++;
  } else {
    console.log(`OK   ${label} (${sel}) 生成 ${count} 个条目, ${html.length} 字符`);
  }
}

const hero = store.get("#hero-title")?.innerHTML ?? "";
const icao = (hero.match(/class="hero-icao">([A-Z]{4})/) || [])[1];
console.log(`\n今日机场: ${icao || "（未解析到）"}`);
console.log(`日期文案: ${store.get("#today-date")?.textContent || "（空）"}`);
console.log(`机场计数: ${store.get("#airport-count")?.textContent || "（空）"}`);
console.log(
  `航线折叠: 计数=${store.get("#route-count")?.textContent || "（空）"} 按钮=${store.get("#route-more")?.textContent || "（无）"}`
);

const bg = store.get("#bg-layer")?.innerHTML ?? "";
console.log(`背景图: ${(bg.match(/<img/g) || []).length} 张`);

/* 搜索 + SimBrief 自检 */
if (typeof window.__dshSearch === "function") {
  for (const q of ["拉萨", "ZULS", "Innsbruck", "VQ", "北京", "中国", "Courchevel"]) {
    const r = window.__dshSearch(q);
    console.log(`搜索「${q}」→ ${r.map((x) => x.icao).join(", ") || "（无结果）"}`);
  }
  const r1 = window.__dshSearch("拉萨");
  if (r1[0]) console.log(`SimBrief 示例: ${window.__simBriefUrl(icao || "ZULS", r1[0].icao, "b738")}`);
} else {
  console.log("搜索: 未暴露 __dshSearch（跳过自检）");
}

if (failed) {
  console.error(`\n${failed} 项检查未通过`);
  process.exit(1);
}
console.log("\n全部检查通过");

const showArg = process.argv.find((a) => a.startsWith("--show="));
if (showArg) {
  const sel = showArg.slice("--show=".length);
  console.log(`\n--- ${sel} ---\n${store.get(sel)?.innerHTML ?? "（未生成）"}`);
}
