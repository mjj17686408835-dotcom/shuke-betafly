/* 抓一批机场的实况天气（METAR），生成 js/weather-auto.js。
   每天北京时间 08:00 由 GitHub Actions 跑一次；手动：node scripts/build-weather.mjs
   数据源 aviationweather.gov（美国 NOAA 公开接口，免费、无需 key，返回的就是原始 METAR）。

   为什么不是 flightradar24：FR24 页面上的机场天气本身就是 METAR，
   而且它有反爬和条款限制（禁止抓取），直接用 METAR 原始源更稳、数据同源。
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "js/weather-auto.js");
const API = "https://aviationweather.gov/api/data/metar";

/* 候选池（一定要有，首屏和卡片墙用） */
const dataCode = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
const POOL = new Function(`${dataCode}\nreturn AIRPORTS;`)().map((a) => a.icao);

/* 再补一批国内主要机场，搜索到它们的轻量卡片时也能看到天气 */
const autoCode = fs.readFileSync(path.join(root, "js/airports-auto.js"), "utf8");
const INDEX = new Function(`${autoCode}\nreturn AIRPORT_INDEX;`)();
const CN = INDEX.filter(([icao, iata, , , country]) => country === "CN" && iata)
  .slice(0, 45)
  .map((r) => r[0]);

const ids = [...new Set([...POOL, ...CN])];
console.log(`共 ${ids.length} 座机场（候选池 ${POOL.length} + 国内 ${CN.length}）`);

function fmtWind(dir, spd) {
  if (spd == null) return "";
  const kt = Math.round(spd * 1.94384); // 接口给的是 m/s，习惯用节
  if (kt <= 1) return "静风";
  const d = dir === "VRB" || dir === "000" ? "VRB" : String(Math.round(Number(dir)));
  return `${d} ${kt} kt`;
}

function fmtVis(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.endsWith("+")) {
    const mi = Number(s.slice(0, -1));
    return `${Math.round(mi * 1.609)} km+`;
  }
  const mi = Number(s);
  if (!Number.isFinite(mi)) return s;
  return mi >= 1 ? `${(mi * 1.609).toFixed(1)} km` : `${Math.round(mi * 1609)} m`;
}

async function fetchBatch(batch) {
  const url = `${API}?ids=${batch.join(",")}&format=json&hours=3`;
  const res = await fetch(url, {
    headers: { "User-Agent": "shuke-betafly/1.0 (+static site)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arr = await res.json();
  return Array.isArray(arr) ? arr : [];
}

const out = {};
const BATCH = 20;
for (let i = 0; i < ids.length; i += BATCH) {
  const batch = ids.slice(i, i + BATCH);
  try {
    const rows = await fetchBatch(batch);
    for (const r of rows) {
      const icao = r.icaoId;
      if (!icao) continue;
      const clouds = (r.clouds || [])
        .map((c) => `${c.cover}${c.base != null ? Math.round(c.base * 0.3048) + "m" : ""}`)
        .join(" ");
      out[icao] = {
        obs: r.reportTime ? String(r.reportTime).replace(".000Z", "Z") : "",
        temp: r.temp,
        dewp: r.dewp,
        wind: fmtWind(r.wdir, r.wspd),
        vis: fmtVis(r.visib),
        qnh: r.altim,
        sky: r.cover || clouds || "",
        clouds,
        flt: r.fltCat || "",
        raw: (r.rawOb || "").replace(/^METAR\s+/, ""),
      };
    }
    console.log(`第 ${i / BATCH + 1} 批：拿到 ${rows.length} 条`);
  } catch (e) {
    console.log(`第 ${i / BATCH + 1} 批失败：${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 500));
}

if (!Object.keys(out).length) {
  console.error("一条都没有，保留旧的 weather-auto.js");
  process.exit(1);
}

const stamp = new Date(Date.now() + 8 * 3600e3).toISOString().replace(/\.\d+Z$/, "+08:00");
const body = `/* 自动生成，别手改 —— 每天北京时间 08:00 由 GitHub Actions 重新生成。
   数据源 aviationweather.gov 的 METAR 实况。重新生成：node scripts/build-weather.mjs
   字段：obs 观测时间 / temp 温度 / dewp 露点 / wind 风 / vis 能见度 / qnh 修正海压 /
         sky 云况 / clouds 云层 / flt 飞行类别(VFR/MVFR/IFR/LIFR) / raw 原始报文 */
const WEATHER_AUTO = ${JSON.stringify({ updated: stamp, data: out }, null, 1)};
`;

fs.writeFileSync(OUT, body, "utf8");
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n写入 js/weather-auto.js：${Object.keys(out).length} 座机场，${kb} KB`);
