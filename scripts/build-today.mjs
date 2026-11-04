/* 每天从「全部可飞机场」里挑三座，生成 js/today-auto.js。
   三个方案分工：好飞的枢纽 / 有挑战的 / 风景好的，各有当天的真实天气。
   数据源：OurAirports（机场与跑道）+ Open-Meteo（天气，免费无 key）。
   北京时间早上 6 点由 GitHub Actions 跑一次。用法：node scripts/build-today.mjs
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "js/today-auto.js");
const BASE = "https://davidmegginson.github.io/ourairports-data/";
const RUNWAY_MIN_M = 1500;

/* ---------- 读 CSV（带 24 小时缓存） ---------- */
const CACHE_DIR = path.join(os.tmpdir(), "dsh-ourairports");
const CACHE_TTL_MS = 24 * 3600 * 1000;

async function fetchCsv(name) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, name);
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < CACHE_TTL_MS) {
    return fs.readFileSync(file, "utf8");
  }
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`${name} 返回 ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}

function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/* ---------- 跑道：每座机场取最长的一条 ---------- */
const rwText = await fetchCsv("runways.csv");
const rwLines = rwText.split(/\r?\n/);
const rwHead = splitCsv(rwLines[0]);
const rwId = rwHead.indexOf("airport_ident");
const rwLen = rwHead.indexOf("length_ft");
const longest = {};
for (let i = 1; i < rwLines.length; i++) {
  if (!rwLines[i]) continue;
  const r = splitCsv(rwLines[i]);
  const id = r[rwId];
  const len = Number(r[rwLen]);
  if (!id || !Number.isFinite(len)) continue;
  if (!longest[id] || len > longest[id]) longest[id] = len;
}

/* ---------- 机场 ---------- */
const apText = await fetchCsv("airports.csv");
const apLines = apText.split(/\r?\n/);
const head = splitCsv(apLines[0]);
const C = (n) => head.indexOf(n);
const iIdent = C("ident");
const iType = C("type");
const iName = C("name");
const iLat = C("latitude_deg");
const iLon = C("longitude_deg");
const iElev = C("elevation_ft");
const iIso = C("iso_country");
const iMuni = C("municipality");
const iIata = C("iata_code");
const iSched = C("scheduled_service");

/* 群友主要在东亚飞：本国加权最高，周边次之，洲际枢纽再次 */
const NEAR = new Set([
  "CN", "HK", "MO", "TW", "JP", "KR", "MN",
  "TH", "VN", "LA", "KH", "MM", "MY", "SG", "ID", "PH", "BN",
  "IN", "NP", "BT", "LK", "BD", "PK",
  "KZ", "KG", "TJ", "UZ", "TM", "RU",
]);

const SCENIC = /(island|beach|bay|harbour|harbor|coast|glacier|volcano|canyon|valley|mountain|peak|lake|falls|desert|savanna|reef|lagoon|fjord|strait|dune)/i;

/* 什么算「值得飞」？最硬的信号是：有人专门为它做了 MSFS 地景。
   地景库每天自动更新，所以池子会自己长大，不是一份写死的名单。 */
const scenicCode = fs.readFileSync(path.join(root, "js/scenery-auto.js"), "utf8");
const SCENERY = new Function(`${scenicCode}\nreturn SCENERY_AUTO;`)();
const dataCode = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
const CURATED = new Function(`${dataCode}\nreturn AIRPORTS;`)().map((a) => a.icao);

const wantSet = new Set(CURATED);
for (const s of SCENERY) if (s.airport) wantSet.add(s.airport);

const pool = [];
for (let i = 1; i < apLines.length; i++) {
  if (!apLines[i]) continue;
  const r = splitCsv(apLines[i]);
  const type = r[iType];
  if (type !== "large_airport" && type !== "medium_airport") continue;
  const icao = r[iIdent];
  if (!/^[A-Z]{4}$/.test(icao)) continue;
  if (!r[iIata]) continue;
  /* 有地景的机场放宽：没定期航班但有人做地景，说明值得飞 */
  const curated = wantSet.has(icao);
  if (!curated && r[iSched] !== "yes") continue;
  const rwyFt = longest[icao];
  if (!rwyFt) continue;
  const rwy = Math.round(rwyFt * 0.3048);
  if (rwy < (curated ? 1200 : RUNWAY_MIN_M)) continue;
  const lat = Number(r[iLat]);
  const lon = Number(r[iLon]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const elevFt = Number(r[iElev]);
  pool.push({
    icao,
    iata: r[iIata],
    name: r[iName],
    city: r[iMuni] || "",
    country: r[iIso] || "",
    lat,
    lon,
    elev: Number.isFinite(elevFt) ? Math.round(elevFt * 0.3048) : 0,
    rwy,
    large: type === "large_airport",
    scenic: SCENIC.test(r[iName] + " " + (r[iMuni] || "")),
  });
}
console.log(`可飞机场池：${pool.length} 座（跑道 ≥ ${RUNWAY_MIN_M} m、有 IATA、有定期航班）`);

/* 重要性：离群友近的、枢纽的排在前面。只取前 800 座查天气，免得把免费接口刷爆 */
function importance(a) {
  let s = 0;
  if (a.country === "CN") s += 30;
  else if (a.country === "HK" || a.country === "MO" || a.country === "TW") s += 26;
  else if (NEAR.has(a.country)) s += 14;
  if (a.large) s += 8;
  if (a.rwy >= 3000) s += 4;
  return s;
}
for (const a of pool) {
  a.imp = importance(a);
  a.quality = a.imp + feature(a) * 1.25;
}

const candidates = pool.filter((a) => wantSet.has(a.icao));
const missing = [...wantSet].filter((ic) => !candidates.some((a) => a.icao === ic));
console.log(`精品池：地景库 + 精选共 ${wantSet.size} 座，可用 ${candidates.length} 座（${missing.length} 座不在可飞池里，已跳过）`);

/* ---------- 静态特色分：越高越「值得专程飞」 ---------- */
function feature(a) {
  let s = 0;
  if (a.elev > 3000) s += 30;
  else if (a.elev > 2200) s += 24;
  else if (a.elev > 1500) s += 16;
  else if (a.elev > 800) s += 7;

  if (a.rwy < 1600) s += 22;
  else if (a.rwy < 1900) s += 14;
  else if (a.rwy >= 3500) s += 5;

  if (a.scenic) s += 16;
  if (Math.abs(a.lat) > 60) s += 10; /* 极圈附近，风景与运行都特别 */
  if (a.large) s += 4;
  return s;
}

/* ---------- 天气（批量查，一次最多 50 个坐标） ---------- */
const WMO = {
  0: "晴", 1: "大部晴朗", 2: "多云", 3: "阴", 45: "有雾", 48: "雾凇",
  51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨", 56: "冻毛毛雨", 57: "冻毛毛雨",
  61: "小雨", 63: "中雨", 65: "大雨", 66: "冻雨", 67: "冻雨",
  71: "小雪", 73: "中雪", 75: "大雪", 77: "米雪", 80: "阵雨", 81: "阵雨",
  82: "强阵雨", 85: "阵雪", 86: "阵雪", 95: "雷暴", 96: "雷暴伴冰雹", 99: "雷暴伴冰雹",
};

async function batchWeather(batch, attempt = 0) {
  const lat = batch.map((a) => a.lat.toFixed(3)).join(",");
  const lon = batch.map((a) => a.lon.toFixed(3)).join(",");
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,weather_code,cloud_cover,visibility,precipitation,wind_speed_10m,is_day" +
    "&timezone=auto";
  const res = await fetch(url, {
    headers: { "User-Agent": "shuke-betafly/1.0 (+static site)" },
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 429 && attempt < 4) {
    const wait = 3000 * Math.pow(2, attempt);
    await new Promise((r) => setTimeout(r, wait));
    return batchWeather(batch, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return Array.isArray(j) ? j : [j];
}

function weatherScore(w) {
  let s = 100;
  s -= (w.cloud || 0) * 0.5;
  if (w.vis >= 30000) s += 10;
  else if (w.vis >= 15000) s += 4;
  else if (w.vis < 5000) s -= 30;
  s -= (w.precip || 0) * 15;
  const c = w.code || 0;
  if (c >= 95) s -= 70;
  else if (c >= 71 && c <= 77) s -= 40;
  else if (c >= 45 && c <= 48) s -= 35;
  else if (c >= 51 && c <= 67) s -= 30;
  else if (c >= 80 && c <= 82) s -= 35;
  if (w.wind > 35) s -= (w.wind - 35) * 0.8;
  s += w.isDay ? 6 : -8;
  return Math.round(s * 10) / 10;
}

function todayKey() {
  return new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
}

/* 最近推过的机场，30 天内不再出现 */
function recentIcaos() {
  if (!fs.existsSync(OUT)) return [];
  const txt = fs.readFileSync(OUT, "utf8");
  const m = txt.match(/"history":\s*\[([^\]]*)\]/);
  if (!m) return [];
  return (m[1].match(/[A-Z]{4}/g) || []).slice(-30);
}

const recent = new Set(recentIcaos());
const scored = [];
const BATCH = 50;

for (let i = 0; i < candidates.length; i += BATCH) {
  const batch = candidates.slice(i, i + BATCH);
  let rows;
  try {
    rows = await batchWeather(batch);
  } catch (e) {
    console.log(`第 ${i / BATCH + 1} 批失败：${e.message}`);
    await new Promise((r) => setTimeout(r, 800));
    continue;
  }
  batch.forEach((a, k) => {
    const cur = rows[k] && rows[k].current;
    if (!cur) return;
    const w = {
      temp: cur.temperature_2m,
      code: cur.weather_code,
      cloud: cur.cloud_cover,
      vis: cur.visibility,
      precip: cur.precipitation,
      wind: cur.wind_speed_10m,
      isDay: cur.is_day === 1,
    };
    const ws = weatherScore(w);
    const fs2 = feature(a);
    /* 质量定档（60%），当天天气排序（40%）；最近推过的压到后排 */
    let total = a.quality * 0.6 + ws * 0.9;
    if (recent.has(a.icao)) total -= 70;
    a.w = w;
    a.wtext = WMO[w.code] || `天气码 ${w.code}`;
    a.wscore = ws;
    a.fscore = fs2;
    a.total = Math.round(total * 10) / 10;
    scored.push(a);
  });
  if ((i / BATCH + 1) % 5 === 0) console.log(`  已评 ${scored.length} 座…`);
  await new Promise((r) => setTimeout(r, 250));
}

if (!scored.length) {
  console.error("一座机场的天气都没拿到，放弃（保留旧的 today-auto.js）");
  process.exit(1);
}
console.log(`拿到天气：${scored.length} 座`);

/* ---------- 三个方案分工 ---------- */
function pickBest(list, role, used, usedCountries) {
  const sorted = [...list].sort((a, b) => b.total - a.total);
  const fresh = sorted.filter((a) => !used.has(a.icao));
  const foreign = fresh.filter((a) => !usedCountries.has(a.country));
  const winner = (foreign[0] || fresh[0]);
  if (!winner) return null;
  used.add(winner.icao);
  usedCountries.add(winner.country);
  return { ...winner, role };
}

const used = new Set();
const usedCountries = new Set();
const picks = [];

const hubPool = scored.filter((a) => a.large && a.rwy >= 2800 && a.elev < 1500);
const challengePool = scored.filter((a) => a.elev >= 1500 || a.rwy <= 1900);
const scenicPool = scored.filter((a) => a.scenic || Math.abs(a.lat) > 55);

const p1 = pickBest(hubPool, "hub", used, usedCountries);
if (p1) picks.push(p1);
const p2 = pickBest(challengePool, "challenge", used, usedCountries);
if (p2) picks.push(p2);
const p3 = pickBest(scenicPool, "scenic", used, usedCountries);
if (p3) picks.push(p3);

/* 某个池子空了就全局补位，保证一定有三座 */
while (picks.length < 3) {
  const extra = pickBest(scored, "more", used, usedCountries);
  if (!extra) break;
  picks.push(extra);
}

for (const p of picks) {
  console.log(
    `${p.role.padEnd(9)} ${p.icao} ${p.name}（${p.city} ${p.country}）` +
      ` 海拔 ${p.elev}m 跑道 ${p.rwy}m · ${p.wtext} ${Math.round(p.w.temp)}°C · 总 ${p.total}`
  );
}

const history = [...recentIcaos(), ...picks.map((p) => p.icao)].slice(-30);

const body = `/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = ${JSON.stringify(
  {
    date: todayKey(),
    generated: new Date().toISOString(),
    icao: picks[0] ? picks[0].icao : "",
    picks: picks.map((p) => ({
      icao: p.icao,
      role: p.role,
      name: p.name,
      city: p.city,
      country: p.country,
      elev: p.elev,
      rwy: p.rwy,
      score: p.total,
      weather: {
        text: p.wtext,
        temp: Math.round(p.w.temp),
        cloud: p.w.cloud,
        vis: p.w.vis,
        wind: Math.round(p.w.wind),
        isDay: p.w.isDay,
        code: p.w.code,
      },
    })),
    history,
  },
  null,
  2
)};
`;

fs.writeFileSync(OUT, body, "utf8");
console.log(`\n写入 js/today-auto.js：${picks.length} 个方案`);
