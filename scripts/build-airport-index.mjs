/* 生成 js/airports-auto.js：顶部搜索框用的机场索引。
   数据源 OurAirports（public domain），只保留大型机场 + 有定期航班的机场，够搜索用。
   用法：node scripts/build-airport-index.mjs
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AIRPORTS_CSV = "https://davidmegginson.github.io/ourairports-data/airports.csv";

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const CACHE_DIR = path.join(os.tmpdir(), "dsh-ourairports");
const CACHE_TTL_MS = 24 * 3600 * 1000;

async function fetchCached(url) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, url.split("/").pop());
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < CACHE_TTL_MS) {
    console.log(`缓存命中 ${path.basename(file)}`);
    return fs.readFileSync(file, "utf8");
  }
  console.log(`下载 ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 返回 ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}

/* data.js 里那 12 座机场的中文名，让搜索支持中文 */
const dataCode = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
const LOCAL = new Function(`${dataCode}\nreturn AIRPORTS;`)();
const cn = {};
for (const ap of LOCAL) cn[ap.icao] = [ap.name, ap.city];

const text = await fetchCached(AIRPORTS_CSV);
const lines = text.split(/\r?\n/);
const header = parseCsvLine(lines[0]);
const col = (name) => header.indexOf(name);
const iIdent = col("ident");
const iType = col("type");
const iName = col("name");
const iIso = col("iso_country");
const iMuni = col("municipality");
const iIata = col("iata_code");
const iSched = col("scheduled_service");
const iLat = col("latitude_deg");
const iLon = col("longitude_deg");

/* 本站候选池（data.js 的 AIRPORTS）的坐标，天气接口要用 */
const wanted = new Set(LOCAL.map((a) => a.icao));
const geo = {};
for (let i = 1; i < lines.length; i++) {
  if (!lines[i]) continue;
  const r = parseCsvLine(lines[i]);
  const ident = r[iIdent];
  if (!wanted.has(ident)) continue;
  const lat = Number(r[iLat]);
  const lon = Number(r[iLon]);
  if (Number.isFinite(lat) && Number.isFinite(lon)) geo[ident] = [lat, lon];
}

const rows = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i]) continue;
  const r = parseCsvLine(lines[i]);
  const type = r[iType];
  if (type !== "large_airport" && type !== "medium_airport") continue;
  const ident = r[iIdent];
  if (!/^[A-Z]{4}$/.test(ident)) continue;
  if (r[iSched] !== "yes" && !r[iIata]) continue;
  rows.push([ident, r[iIata] || "", r[iName].replace(/"/g, ""), r[iMuni] || "", r[iIso] || ""]);
}

rows.sort((a, b) => a[0].localeCompare(b[0]));

const out = `/* 自动生成，别手改。数据源 OurAirports（public domain）。
   重新生成：node scripts/build-airport-index.mjs
   字段：[ICAO, IATA, 名称, 城市, 国家] */
const AIRPORT_INDEX = ${JSON.stringify(rows)};

/* 本站 12 座机场的中文名，用来支持中文搜索 */
const AIRPORT_CN = ${JSON.stringify(cn, null, 0)};

/* 本站候选机场坐标 [纬度, 经度]，天气评分用 */
const AIRPORT_GEO = ${JSON.stringify(geo, null, 0)};
`;

fs.writeFileSync(path.join(root, "js/airports-auto.js"), out, "utf8");

const kb = (fs.statSync(path.join(root, "js/airports-auto.js")).size / 1024).toFixed(0);
console.log(`写入 js/airports-auto.js：${rows.length} 座机场，${kb} KB`);
console.log(`坐标：${Object.keys(geo).length} 座 ${Object.keys(geo).join(", ")}`);
