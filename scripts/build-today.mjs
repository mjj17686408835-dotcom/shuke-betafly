/* 每天挑一座「今天天气最适合飞、也最值得看」的机场，生成 js/today-auto.js。
   数据源 Open-Meteo（免费、无需 key）。北京时间早上 6 点由 GitHub Actions 跑一次。
   用法：node scripts/build-today.mjs
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "js/today-auto.js");

/* 读 data.js 的候选池 */
const dataCode = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
const AIRPORTS = new Function(`${dataCode}\nreturn AIRPORTS;`)();

/* 读坐标 */
const autoCode = fs.readFileSync(path.join(root, "js/airports-auto.js"), "utf8");
const AIRPORT_GEO = new Function(`${autoCode}\nreturn AIRPORT_GEO;`)();

/* 昨天选中的是哪座，尽量别连着两天重样 */
function previousIcao() {
  if (!fs.existsSync(OUT)) return "";
  const m = fs.readFileSync(OUT, "utf8").match(/"icao"\s*:\s*"([A-Z]{4})"/);
  return m ? m[1] : "";
}

const WMO = {
  0: "晴", 1: "大部晴朗", 2: "多云", 3: "阴",
  45: "有雾", 48: "雾凇", 51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨",
  56: "冻毛毛雨", 57: "冻毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨",
  66: "冻雨", 67: "冻雨", 71: "小雪", 73: "中雪", 75: "大雪", 77: "米雪",
  80: "阵雨", 81: "阵雨", 82: "强阵雨", 85: "阵雪", 86: "阵雪",
  95: "雷暴", 96: "雷暴伴冰雹", 99: "雷暴伴冰雹",
};

/* 打分：0 分起步，越高越"今天该去" */
function score(w, icao) {
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

  /* 分数接近时用日期做一点微扰，避免永远同一座 */
  let h = 0;
  const key = `${todayKey()}:${icao}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  s += (h % 7) - 3;

  return Math.round(s * 10) / 10;
}

function todayKey() {
  return new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
}

async function weather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,weather_code,cloud_cover,visibility,precipitation,wind_speed_10m,is_day" +
    "&timezone=auto";
  const res = await fetch(url, {
    headers: { "User-Agent": "shuke-betafly/1.0 (+static site)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const c = j.current || {};
  return {
    temp: c.temperature_2m,
    code: c.weather_code,
    cloud: c.cloud_cover,
    vis: c.visibility,
    precip: c.precipitation,
    wind: c.wind_speed_10m,
    isDay: c.is_day === 1,
  };
}

const prev = previousIcao();
const rows = [];

for (const ap of AIRPORTS) {
  const geo = AIRPORT_GEO[ap.icao];
  if (!geo) {
    console.log(`跳过 ${ap.icao}：没有坐标`);
    continue;
  }
  try {
    const w = await weather(geo[0], geo[1]);
    w.score = score(w, ap.icao);
    w.text = WMO[w.code] || `天气码 ${w.code}`;
    rows.push({ icao: ap.icao, name: ap.name, ...w });
    console.log(
      `${ap.icao} ${String(w.score).padStart(6)} 分 · ${w.text} · 云 ${w.cloud}% · 能见 ${Math.round(w.vis / 100) / 10}km · ${Math.round(w.temp)}°C${w.isDay ? "" : " · 夜"}`
    );
  } catch (e) {
    console.log(`跳过 ${ap.icao}：${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

if (!rows.length) {
  console.error("一座机场的天气都没拿到，放弃（保留旧的 today-auto.js）");
  process.exit(1);
}

rows.sort((a, b) => b.score - a.score);

/* 别和昨天撞车：昨天那座今天如果还是第一，就退一位 */
let winner = rows[0];
if (prev && winner.icao === prev && rows.length > 1) {
  console.log(`昨天已是 ${prev}，今天换 ${rows[1].icao}`);
  winner = rows[1];
}

const out = `/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 Open-Meteo。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / icao 今日机场 / weather 当时天气 / ranking 全部候选打分 */
const TODAY_AUTO = ${JSON.stringify(
  {
    date: todayKey(),
    generated: new Date().toISOString(),
    icao: winner.icao,
    weather: {
      text: winner.text,
      temp: Math.round(winner.temp),
      cloud: winner.cloud,
      vis: winner.vis,
      wind: Math.round(winner.wind),
      isDay: winner.isDay,
      code: winner.code,
    },
    ranking: rows.map((r) => [r.icao, r.score, r.text]),
  },
  null,
  2
)};
`;

fs.writeFileSync(OUT, out, "utf8");
console.log(`\n写入 js/today-auto.js：今日 ${winner.icao} ${winner.name}（${winner.text}，${Math.round(winner.temp)}°C）`);
