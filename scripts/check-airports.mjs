/* 开发用：拿 OurAirports 的公开数据核对 js/data.js 里的机场字段（标高 / 主跑道长度）。
   OurAirports 数据是公共领域（public domain），可自由使用。
   用法：node scripts/check-airports.mjs
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const AIRPORTS_CSV = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const RUNWAYS_CSV = "https://davidmegginson.github.io/ourairports-data/runways.csv";

const code = fs.readFileSync(path.join(root, "js/data.js"), "utf8");
// eslint-disable-next-line no-new-func
const AIRPORTS = new Function(`${code}\nreturn AIRPORTS;`)();

const wanted = new Set(AIRPORTS.map((a) => a.icao));

/* 极简 CSV 解析：OurAirports 的字段里含引号包裹的逗号，需要按引号切 */
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

/* 15 MB 的 CSV 每次重下太慢，缓存到系统临时目录，24 小时内复用 */
const CACHE_DIR = path.join(os.tmpdir(), "dsh-ourairports");
const CACHE_TTL_MS = 24 * 3600 * 1000;

async function fetchCached(url) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, url.split("/").pop());
  if (fs.existsSync(file)) {
    const age = Date.now() - fs.statSync(file).mtimeMs;
    if (age < CACHE_TTL_MS) {
      console.log(`缓存命中 ${path.basename(file)}（${Math.round(age / 60000)} 分钟前下载）`);
      return fs.readFileSync(file, "utf8");
    }
  }
  console.log(`下载 ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 返回 ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
}

async function loadCsv(url, onRow) {
  const text = await fetchCached(url);
  const lines = text.split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    onRow(parseCsvLine(line), header);
  }
}

const elevByIcao = new Map();
const runwaysByIcao = new Map();

console.log("拉取 OurAirports 数据…");
await loadCsv(AIRPORTS_CSV, (row, header) => {
  const ident = row[header.indexOf("ident")];
  if (!wanted.has(ident)) return;
  elevByIcao.set(ident, {
    elevFt: Number(row[header.indexOf("elevation_ft")]),
    name: row[header.indexOf("name")],
    type: row[header.indexOf("type")],
  });
});

await loadCsv(RUNWAYS_CSV, (row, header) => {
  const ident = row[header.indexOf("airport_ident")];
  if (!wanted.has(ident)) return;
  if (row[header.indexOf("closed")] === "1") return;
  const len = Number(row[header.indexOf("length_ft")]);
  if (!len) return; // 水上跑道等没有长度
  const list = runwaysByIcao.get(ident) || [];
  list.push({ len, le: row[header.indexOf("le_ident")], he: row[header.indexOf("he_ident")] });
  runwaysByIcao.set(ident, list);
});

const m = (ft) => Math.round(ft * 0.3048);

let diff = 0;
console.log("");
console.log("ICAO  我的标高      真实标高     我的跑道          真实最长跑道");
console.log("-".repeat(78));

for (const ap of AIRPORTS) {
  const real = elevByIcao.get(ap.icao);
  const runways = (runwaysByIcao.get(ap.icao) || []).sort((a, b) => b.len - a.len);
  const main = runways[0];

  const myElevFt = Number((ap.elev.match(/([\d,]+)\s*ft/) || [])[1]?.replace(/,/g, ""));
  const myRwyM = Number((ap.runway.match(/([\d,]+)\s*m/) || [])[1]?.replace(/,/g, ""));

  const elevOk = real && Number.isFinite(myElevFt) && Math.abs(myElevFt - real.elevFt) <= 30;
  const rwyOk = main && Number.isFinite(myRwyM) && Math.abs(myRwyM - m(main.len)) <= 30;

  if (!elevOk || !rwyOk) diff++;

  const flag = elevOk && rwyOk ? "  " : "✗ ";
  console.log(
    `${flag}${ap.icao}  ${ap.elev.padEnd(18)} ${(real ? `${real.elevFt} ft` : "?").padEnd(12)} ` +
      `${ap.runway.padEnd(18)} ${main ? `${main.le}/${main.he} ${m(main.len)} m` : "?"}`
  );
  if (runways.length > 1) {
    console.log(
      `    └ 全部跑道: ${runways
        .map((r) => `${r.le}/${r.he} ${m(r.len)}m`)
        .join(" | ")}`
    );
  }
}

console.log("");
console.log(diff === 0 ? "全部机场的标高与主跑道长度与 OurAirports 一致（30 m 容差内）" : `${diff} 座机场数据需要修正`);
