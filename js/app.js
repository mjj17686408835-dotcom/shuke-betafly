/* =========================================================
   飞行俱乐部 · 交互逻辑
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- 每日轮换 ---------- */
  const EPOCH = Date.UTC(2026, 0, 1);
  let shuffleOffset = 0; // 「换一座」的偏移
  let lockedIcao = null; // 点了某张机场卡片后锁定

  function dayIndex() {
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((todayUTC - EPOCH) / 86400000);
  }

  /* 北京时间的今天（YYYY-MM-DD），和 GitHub Actions 早上 6 点生成的日期对齐 */
  function todayKey() {
    return new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  }

  /* 当天早上 6 点生成的「天气最好的一座」；文件没更新就返回 null，回退到按日期轮换 */
  function todayAuto() {
    if (typeof TODAY_AUTO === "undefined" || !TODAY_AUTO || !TODAY_AUTO.icao) return null;
    if (TODAY_AUTO.date !== todayKey()) return null;
    return TODAY_AUTO;
  }

  /* 某座机场的实况：优先用 METAR 快照（每天 8 点更新），
     首屏那座如果没有 METAR（比如拉萨 ZULS 不报），退回早上 6 点选机场时抓的天气 */
  function weatherOf(icao) {
    if (typeof WEATHER_AUTO !== "undefined" && WEATHER_AUTO && WEATHER_AUTO.data) {
      const w = WEATHER_AUTO.data[icao];
      if (w) return w;
    }
    const auto = todayAuto();
    if (auto && auto.icao === icao && auto.weather) {
      const w = auto.weather;
      return {
        temp: w.temp,
        wind: w.wind < 1 ? "静风" : `${Math.round(w.wind)} km/h`,
        vis: w.vis >= 1000 ? `${Math.round(w.vis / 1000)} km` : `${w.vis} m`,
        sky: w.text,
        flt: "",
        from: "open-meteo",
      };
    }
    return null;
  }

  function todayAirport() {
    if (lockedIcao) {
      const hit = AIRPORTS.find((a) => a.icao === lockedIcao);
      if (hit) return hit;
    }
    const auto = todayAuto();
    if (auto) {
      const hit = AIRPORTS.find((a) => a.icao === auto.icao);
      if (hit) return hit;
    }
    const n = AIRPORTS.length;
    const i = (((dayIndex() + shuffleOffset) % n) + n) % n;
    return AIRPORTS[i];
  }

  function todayLabel() {
    const d = new Date();
    const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}`;
  }

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 中文搜索辅助（全量索引里只有英文，这里补常用译名） ---------- */

  /* 城市 -> 该城市的机场（只收有把握的，宁缺勿错） */
  const CITY_CN = {
    北京: ["ZBAA", "ZBAD"], 上海: ["ZSPD", "ZSSS"], 广州: ["ZGGG"], 深圳: ["ZGSZ"],
    成都: ["ZUUU", "ZUTF"], 昆明: ["ZPPP"], 西安: ["ZLXY"], 重庆: ["ZUCK"],
    杭州: ["ZSHC"], 南京: ["ZSNJ"], 武汉: ["ZHHH"], 长沙: ["ZGHA"],
    郑州: ["ZHCC"], 青岛: ["ZSQD"], 厦门: ["ZSAM"], 天津: ["ZBTJ"],
    乌鲁木齐: ["ZWWW"], 三亚: ["ZJSY"], 拉萨: ["ZULS"], 哈尔滨: ["ZYHB"],
    沈阳: ["ZYTX"], 大连: ["ZYTL"], 海口: ["ZJHK"], 福州: ["ZSFZ"],
    贵阳: ["ZUGY"], 南宁: ["ZGNN"], 兰州: ["ZLLL"], 太原: ["ZBYN"],
    济南: ["ZSJN"], 合肥: ["ZSOF"], 南昌: ["ZSCN"], 宁波: ["ZSNB"],
    温州: ["ZSWZ"], 珠海: ["ZGSD"], 桂林: ["ZGKL"], 西宁: ["ZLXN"],
    银川: ["ZLIC"], 呼和浩特: ["ZBHH"], 香港: ["VHHH"], 澳门: ["VMMC"],
    台北: ["RCTP", "RCSS"], 高雄: ["RCKH"],
  };

  /* 中文国家名 -> ISO 两位码（OurAirports 的 iso_country） */
  const COUNTRY_CN = {
    中国: "CN", 日本: "JP", 韩国: "KR", 泰国: "TH", 新加坡: "SG", 马来西亚: "MY",
    越南: "VN", 菲律宾: "PH", 印度尼西亚: "ID", 印度: "IN", 尼泊尔: "NP", 不丹: "BT",
    阿联酋: "AE", 卡塔尔: "QA", 沙特阿拉伯: "SA", 土耳其: "TR", 英国: "GB",
    法国: "FR", 德国: "DE", 荷兰: "NL", 西班牙: "ES", 意大利: "IT", 瑞士: "CH",
    奥地利: "AT", 葡萄牙: "PT", 希腊: "GR", 挪威: "NO", 瑞典: "SE", 芬兰: "FI",
    冰岛: "IS", 加拿大: "CA", 美国: "US", 墨西哥: "MX", 巴西: "BR", 阿根廷: "AR",
    澳大利亚: "AU", 新西兰: "NZ", 南非: "ZA", 埃及: "EG", 摩洛哥: "MA", 直布罗陀: "GI",
  };

  /* 精选机场的英文名/别名，让 "Courchevel" 也能搜到库尔舍维尔 */
  const AIRPORT_EN = {
    ZULS: "Lhasa Gonggar",
    VQPR: "Paro",
    LOWI: "Innsbruck",
    LXGB: "Gibraltar",
    KSEZ: "Sedona",
    KASE: "Aspen Pitkin",
    PAJN: "Juneau",
    VNKT: "Kathmandu Tribhuvan",
    NZQN: "Queenstown",
    TNCM: "Princess Juliana Saint Martin",
    LPMA: "Madeira Funchal",
    LFLJ: "Courchevel",
  };

  /* 反查：ICAO -> [中文城市名...] */
  const CITY_CN_OF = (function () {
    const map = {};
    Object.keys(CITY_CN).forEach(function (city) {
      CITY_CN[city].forEach(function (code) {
        (map[code] = map[code] || []).push(city);
      });
    });
    return map;
  })();

  /* ---------- 照片 ---------- */
  const photos = typeof PHOTOS_AUTO !== "undefined" ? PHOTOS_AUTO : [];

  /* 机型 → 照片：按 type 前缀匹配 */
  const TYPE_MATCH = {
    a350: /^A350/i,
    md11: /^MD-?11/i,
    a320: /^A320/i,
    b777: /^777/i,
    b738: /^737/i,
  };

  function photosOf(aircraftId) {
    const re = TYPE_MATCH[aircraftId];
    return re ? photos.filter((p) => re.test(p.type)) : [];
  }

  /* 每天从整个图库里取 n 张做背景，保证每天不一样 */
  function dailyPhotos(n) {
    if (!photos.length) return [];
    const out = [];
    const start = ((dayIndex() % photos.length) + photos.length) % photos.length;
    for (let i = 0; i < Math.min(n, photos.length); i++) {
      out.push(photos[(start + Math.round((i * photos.length) / n)) % photos.length]);
    }
    return out;
  }

  /* ---------- 背景轮播 ---------- */
  let bgTimer = null;

  /* 背景用本地高清图（js/backgrounds.js），没有才退回机型照片 */
  function backgroundPool() {
    const local = typeof BACKGROUNDS !== "undefined" && Array.isArray(BACKGROUNDS) ? BACKGROUNDS : [];
    if (local.length) return local;
    return photos.map((p) => ({
      src: p.src,
      credit: `${p.photographer || "unknown"} / planespotters.net`,
      link: p.link,
    }));
  }

  function initBackground() {
    const layer = $("#bg-layer");
    if (!layer) return;
    const pool = backgroundPool();
    if (!pool.length) return;

    /* 从今天的位置开始轮，每天第一张不一样 */
    const start = ((dayIndex() % pool.length) + pool.length) % pool.length;
    const list = pool.map((_, i) => pool[(start + i) % pool.length]);

    layer.innerHTML = list
      .map((p) => `<img src="${esc(p.src)}" alt="" decoding="async">`)
      .join("");

    const imgs = [...(layer.querySelectorAll ? layer.querySelectorAll("img") : [])];

    let cur = 0;
    const show = (i) => {
      imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
      const p = list[i];
      const credit = $("#hero-credit");
      if (credit && p) {
        credit.innerHTML = `Photo · ${esc(p.credit || "unknown")} / <a href="${esc(
          p.link || "https://www.pexels.com"
        )}" target="_blank" rel="noopener">${esc(p.link && p.link.includes("planespotters") ? "planespotters.net" : "pexels.com")}</a>`;
      }
    };

    if (imgs[0]) imgs[0].classList.add("is-on");
    show(0);
    if (!imgs.length) return;

    if (typeof setInterval === "function") {
      bgTimer = setInterval(() => {
        /* 跳过还没加载完的图，避免切出一片黑 */
        let target = cur;
        for (let k = 1; k <= imgs.length; k++) {
          const idx = (cur + k) % imgs.length;
          if (idx !== cur && imgs[idx].complete !== false) {
            target = idx;
            break;
          }
        }
        if (target === cur) return;
        cur = target;
        show(cur);
      }, 8000);
      if (bgTimer && typeof bgTimer.unref === "function") bgTimer.unref();
    }
  }

  /* ---------- 渲染：首屏 ---------- */
  function renderToday() {
    const ap = todayAirport();
    const auto = todayAuto();

    const dateEl = $("#today-date");
    if (dateEl) dateEl.textContent = todayLabel();

    const title = $("#hero-title");
    if (title) {
      title.innerHTML = `<span class="hero-icao">${esc(ap.icao)} · ${esc(ap.region)} / ${esc(ap.country)}</span>${esc(
        ap.name
      )}`;
    }

    const sub = $("#hero-sub");
    if (sub) {
      const w = weatherOf(ap.icao);
      if (w) {
        const bits = [];
        if (w.flt) bits.push(esc(w.flt));
        if (w.sky && !w.flt) bits.push(esc(w.sky));
        if (w.temp != null) bits.push(`${esc(w.temp)}°C`);
        if (w.wind) bits.push(`风 ${esc(w.wind)}`);
        if (w.vis) bits.push(`能见 ${esc(w.vis)}`);
        if (w.qnh) bits.push(`QNH ${esc(w.qnh)}`);
        sub.innerHTML = `${esc(ap.why)}<span class="hero-wx">今日实况 · ${bits.join(" · ")}</span>`;
      } else {
        sub.textContent = ap.why;
      }
    }

    const card = $("#hero-card");
    if (card) {
      const scenery = SCENERY.find((s) => s.airport === ap.icao);
      card.innerHTML = `
        <div class="hc-top">
          <span class="hc-icao">${esc(ap.icao)}</span>
          <span class="hc-tag">${ap.difficulty}</span>
        </div>
        <dl class="hc-facts">
          <div><dt>标高</dt><dd>${esc(ap.elev)}</dd></div>
          <div><dt>跑道</dt><dd>${esc(ap.runway)}</dd></div>
          <div><dt>最佳季节</dt><dd>${esc(ap.best)}</dd></div>
          <div><dt>地景</dt><dd>${
            scenery
              ? `<a href="${esc(scenery.url)}" target="_blank" rel="noopener" style="text-decoration:underline">SceneryAddons ↗</a>`
              : "暂无收录"
          }</dd></div>
        </dl>
        <p class="hc-approach">${esc(ap.approach)}</p>`;
    }

    /* 今日航线：从该机场出发的优先，其次是到达的，不够 3 条就补几条顺路的 */
    const out = ROUTES.filter((r) => r.from[0] === ap.icao);
    const into = ROUTES.filter((r) => r.to[0] === ap.icao && r.from[0] !== ap.icao);
    let picks = [...out, ...into].slice(0, 3);

    let noteHtml = "";
    if (picks.length === 0) {
      noteHtml =
        "这座机场不在机队固定航线里，适合当作自由飞行的起点 —— 下面几条是距离最近、适合顺路练手的航线。";
    } else if (picks.length < 3) {
      noteHtml = "从这座机场出发的固定航线就这些，下面补了两条距离相近的，可以顺路飞。";
    }

    if (picks.length < 3) {
      const used = new Set(picks.map((r) => r.from[0] + r.to[0] + r.aircraft));
      const nearby = ROUTES.filter((r) => !used.has(r.from[0] + r.to[0] + r.aircraft))
        .slice()
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3 - picks.length)
        .map((r) => ({ ...r, __nearby: true }));
      picks = [...picks, ...nearby];
    }

    const noteEl = $("#today-route-note");
    if (noteEl) {
      if (noteHtml) {
        noteEl.style.display = "block";
        noteEl.textContent = noteHtml;
      } else {
        noteEl.style.display = "none";
        noteEl.textContent = "";
      }
    }
    const tr = $("#today-routes-list");
    if (tr) tr.innerHTML = picks.map(routeHTML).join("");

    renderAirports();
  }

  /* ---------- 渲染：机场卡片 ---------- */
  let regionFilter = "all";
  let query = "";

  function airportPasses(ap) {
    if (regionFilter !== "all" && ap.region !== regionFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      ap.name.toLowerCase().includes(q) ||
      ap.city.toLowerCase().includes(q) ||
      ap.icao.toLowerCase().includes(q) ||
      ap.iata.toLowerCase().includes(q) ||
      ap.country.toLowerCase().includes(q)
    );
  }

  /* 机场卡片图：默认 images/airports/{ICAO}.jpg，data.js 里也可以显式给 photo 字段 */
  function airportPhoto(ap) {
    if (ap.photo === false) return null;
    return ap.photo || `images/airports/${ap.icao}.jpg`;
  }

  /* 全量索引里的一条 -> 轻量卡片（没有实景图，只用来指路，点了直接开 SimBrief） */
  function liteAirport(hit) {
    const cn = CN_KEYS(hit.icao);
    const cnCities = CITY_CN_OF[hit.icao];
    const shortName = String(hit.name || "")
      .replace(/\s+International\s+Airport$/i, "")
      .replace(/\s+Airport$/i, "")
      .replace(/\s+Air\s*Base$/i, "");
    return {
      icao: hit.icao,
      iata: hit.iata || "",
      name: cn ? cn[0] : shortName,
      city: cn ? cn[1] : cnCities && cnCities.length ? cnCities[0] : hit.city || "",
      country: hit.country || "",
      theme: ["#16262c", "#0a1317"],
      photo: false,
      __lite: true,
    };
  }

  function liteHTML(ap) {
    const today = todayAirport();
    const url = simBriefUrl(today.icao, ap.icao, todayAircraftId());
    const w = weatherOf(ap.icao);
    const wx = w
      ? `<div class="ac-wx">
            <span class="ac-flt flt-${esc(String(w.flt || "").toLowerCase())}">${esc(w.flt || "—")}</span>
            <span>${esc(w.temp)}°C</span>
            <span>风 ${esc(w.wind)}</span>
            <span>能见 ${esc(w.vis)}</span>
          </div>`
      : `<div class="ac-wx ac-wx--none"><span>今日暂无实况观测</span></div>`;
    return `
      <a class="airport-card airport-card--lite" href="${esc(url)}" target="_blank" rel="noopener"
         data-icao="${esc(ap.icao)}"
         style="--c1:${esc(ap.theme[0])};--c2:${esc(ap.theme[1])}">
        <span class="ac-icao">${esc(ap.icao)}</span>
        <div class="ac-body">
          <div class="ac-name">${esc(ap.name)}<span>${esc(ap.city)}</span></div>
          ${wx}
          <div class="ac-meta">
            <span>${esc(ap.iata || "—")}</span>
            <span>${esc(ap.country)}</span>
            <span class="ac-sb">SimBrief ↗</span>
          </div>
        </div>
      </a>`;
  }

  function airportHTML(ap) {
    if (ap.__lite) return liteHTML(ap);
    const today = todayAirport();
    const photo = airportPhoto(ap);
    const w = weatherOf(ap.icao);
    const wx = w
      ? `<div class="ac-wx">
            ${w.flt ? `<span class="ac-flt flt-${esc(String(w.flt).toLowerCase())}">${esc(w.flt)}</span>` : ""}
            <span>${esc(w.temp)}°C</span>
            ${w.wind ? `<span>风 ${esc(w.wind)}</span>` : ""}
            ${w.vis ? `<span>能见 ${esc(w.vis)}</span>` : ""}
          </div>`
      : "";
    return `
      <a class="airport-card" href="#today" data-icao="${esc(ap.icao)}"
         style="--c1:${esc(ap.theme[0])};--c2:${esc(ap.theme[1])}">
        ${photo ? `<img class="ac-photo" src="${esc(photo)}" alt="${esc(ap.name)}" loading="lazy" decoding="async"
             onerror="this.closest('.airport-card').classList.add('no-photo');this.remove()">` : ""}
        <span class="ac-icao">${esc(ap.icao)}</span>
        ${ap.icao === today.icao ? '<span class="ac-today">今日</span>' : ""}
        <div class="ac-body">
          <div class="ac-name">${esc(ap.name)}<span>${esc(ap.city)}</span></div>
          ${wx}
          <div class="ac-meta">
            <span>${esc(ap.elev.split(" / ")[0])}</span>
            <span>${esc(ap.runway)}</span>
            <span>${esc(ap.difficulty)}</span>
          </div>
        </div>
        <span class="ac-go">↗</span>
      </a>`;
  }

  function renderAirports() {
    const grid = $("#airport-grid");
    if (!grid) return;
    const count = $("#airport-count");
    const q = query.trim();

    /* 没输入：按大洲筛选那 12 座精选机场 */
    if (!q) {
      const list = AIRPORTS.filter(airportPasses);
      grid.innerHTML = list.length
        ? list.map(airportHTML).join("")
        : `<p class="hint" style="margin:0">这个洲还没有收录的机场。</p>`;
      if (count) count.textContent = `${list.length} / ${AIRPORTS.length} 座`;
      return;
    }

    /* 有输入：走全量索引（4500+ 座），精选机场优先带图，其余给轻量卡片 */
    const hits = searchAirports(q, 12);
    const featured = AIRPORTS.filter((a) => hits.some((h) => h.icao === a.icao));
    const rest = hits.filter((h) => !featured.some((a) => a.icao === h.icao));
    const html =
      featured.map(airportHTML).join("") + rest.map((h) => liteHTML(liteAirport(h))).join("");

    grid.innerHTML = html || `<p class="hint" style="margin:0">没找到匹配的机场，试试 4 位 ICAO 代码，比如 ZBAA。</p>`;
    if (count) count.textContent = hits.length ? `找到 ${hits.length} 座` : "0 座";
  }

  function renderAirportChips() {
    const box = $("#airport-chips");
    if (!box) return;
    const regions = [...new Set(AIRPORTS.map((a) => a.region))];
    const items = [{ id: "all", label: "全部" }, ...regions.map((r) => ({ id: r, label: r }))];
    box.innerHTML = items
      .map(
        (c) =>
          `<button class="chip${c.id === regionFilter ? " active" : ""}" data-region="${esc(c.id)}">${esc(
            c.label
          )}</button>`
      )
      .join("");
  }

  /* ---------- 渲染：航线 ---------- */
  function aircraftName(id) {
    const a = AIRCRAFT.find((x) => x.id === id);
    return a ? a.short : id;
  }

  function fmtDist(nm) {
    return nm >= 1000 ? nm.toLocaleString("en-US") + " nm" : nm + " nm";
  }

  function routeHTML(r) {
    return `
      <div class="route">
        <div class="route-path">
          <span>${esc(r.from[1])}<span class="code">${esc(r.from[0])}</span></span>
          <span class="arw">→</span>
          <span>${esc(r.to[1])}<span class="code">${esc(r.to[0])}</span></span>
        </div>
        <div class="route-sub">
          <span class="ac">${esc(aircraftName(r.aircraft))}</span>
          <span class="mono">${fmtDist(r.dist)}</span>
          <span class="mono">${esc(r.time)}</span>
          ${r.__nearby ? '<span class="badge">顺路</span>' : ""}
        </div>
        <p class="route-note">${esc(r.note)}</p>
      </div>`;
  }

  let activeFleet = "all";
  let routesExpanded = false;
  const ROUTE_PAGE = 9;

  function renderRoutes() {
    const list = activeFleet === "all" ? ROUTES : ROUTES.filter((r) => r.aircraft === activeFleet);
    const shown = routesExpanded ? list : list.slice(0, ROUTE_PAGE);
    const box = $("#route-list");
    if (box) box.innerHTML = shown.map(routeHTML).join("");
    const count = $("#route-count");
    if (count) count.textContent = `${list.length} 条`;
    const more = $("#route-more");
    if (more) {
      if (list.length > ROUTE_PAGE) {
        more.style.display = "";
        more.textContent = routesExpanded ? "收起" : `显示全部 ${list.length} 条 ↓`;
      } else {
        more.style.display = "none";
      }
    }
  }

  function renderChips() {
    const box = $("#aircraft-chips");
    if (!box) return;
    const chips = [{ id: "all", label: "全部" }, ...AIRCRAFT.map((a) => ({ id: a.id, label: a.short }))];
    box.innerHTML = chips
      .map(
        (c) =>
          `<button class="chip${c.id === activeFleet ? " active" : ""}" data-fleet="${esc(c.id)}">${esc(
            c.label
          )}</button>`
      )
      .join("");
  }

  /* ---------- 渲染：机队 ---------- */
  function renderFleet() {
    const box = $("#fleet");
    if (!box) return;
    const day = dayIndex();

    box.innerHTML = AIRCRAFT.map((a) => {
      const pool = photosOf(a.id);
      const shot = pool.length ? pool[((day % pool.length) + pool.length) % pool.length] : null;
      return `
        <div class="plane">
          ${shot ? `<img class="photo" src="${esc(shot.src)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
          ${shot ? `<span class="credit">© ${esc(shot.photographer)}</span>` : ""}
          <div class="body">
            <div class="pn">${esc(a.name)}</div>
            <div class="pr">${esc(a.role)}</div>
            <dl>
              <dt>航程</dt><dd>${esc(a.range)}</dd>
              <dt>巡航</dt><dd>${esc(a.cruise)}</dd>
              <dt>动力</dt><dd>${esc(a.engines)}</dd>
              <dt>载客</dt><dd>${esc(a.pax)}</dd>
            </dl>
            <p class="pt">${esc(a.tip)}</p>
          </div>
        </div>`;
    }).join("");
  }

  /* ---------- 渲染：地景 ---------- */
  const SCENERY_PAGE = 12;
  let sceneryExpanded = false;

  function allScenery() {
    const auto = typeof SCENERY_AUTO !== "undefined" ? SCENERY_AUTO : [];
    const map = new Map();
    for (const s of [...SCENERY, ...auto]) {
      if (!map.has(s.url)) map.set(s.url, s);
    }
    return [...map.values()];
  }

  function sceneryHTML(s, ap) {
    const note = s.note || (s.date ? `发布于 ${s.date}` : "");
    return `
      <div class="scn">
        <div class="scn-top">
          <span class="scn-icao">${esc(s.airport || "MSFS")}</span>
          <span>${esc(s.author || "")}${s.version ? " · " + esc(s.version) : ""}</span>
          ${s.airport === ap.icao ? '<span class="badge">今日机场</span>' : ""}
        </div>
        <div class="scn-title">${esc(s.title)}</div>
        <p class="scn-note">${esc(note)}</p>
        <a class="scn-link" href="${esc(s.url)}" target="_blank" rel="noopener">查看 / 下载 ↗</a>
      </div>`;
  }

  function renderScenery() {
    const ap = todayAirport();
    const list = allScenery().sort((a, b) => {
      const sa = a.airport === ap.icao ? 0 : 1;
      const sb = b.airport === ap.icao ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (b.date || "") > (a.date || "") ? 1 : -1;
    });

    const shown = sceneryExpanded ? list : list.slice(0, SCENERY_PAGE);
    const box = $("#scenery-list");
    if (box) box.innerHTML = shown.map((s) => sceneryHTML(s, ap)).join("");

    const more = $("#scenery-more");
    if (more) {
      if (list.length > SCENERY_PAGE) {
        more.style.display = "inline-flex";
        more.textContent = sceneryExpanded ? "收起" : `显示全部 ${list.length} 条 ↓`;
      } else {
        more.style.display = "none";
      }
    }
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    const shuffle = $("#shuffle");
    if (shuffle) {
      shuffle.addEventListener("click", () => {
        lockedIcao = null;
        shuffleOffset += 1;
        renderToday();
        renderScenery();
        if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const more = $("#scenery-more");
    if (more) {
      more.addEventListener("click", () => {
        sceneryExpanded = !sceneryExpanded;
        renderScenery();
      });
    }

    /* 机场卡片：点击锁定为今日机场；全量搜索出来的轻量卡片直接开 SimBrief，走原生链接 */
    const grid = $("#airport-grid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".airport-card");
        if (!card) return;
        if (card.classList.contains("airport-card--lite")) return;
        e.preventDefault();
        lockedIcao = card.dataset.icao;
        renderToday();
        renderScenery();
        if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* 大洲筛选 */
    const achips = $("#airport-chips");
    if (achips) {
      achips.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        regionFilter = btn.dataset.region;
        [...achips.querySelectorAll(".chip")].forEach((el) => el.classList.toggle("active", el === btn));
        renderAirports();
      });
    }

    /* 搜索 */
    const search = $("#airport-search");
    if (search) {
      search.addEventListener("input", () => {
        query = search.value.trim();
        renderAirports();
      });
    }

    const go = $("#search-go");
    if (go) {
      go.addEventListener("click", () => {
        const target = $("#airports");
        if (target && typeof target.scrollIntoView === "function") target.scrollIntoView({ behavior: "smooth" });
      });
    }

    /* 机型筛选 */
    const chips = $("#aircraft-chips");
    if (chips) {
      chips.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        activeFleet = btn.dataset.fleet;
        routesExpanded = false;
        [...chips.querySelectorAll(".chip")].forEach((el) => el.classList.toggle("active", el === btn));
        renderRoutes();
      });
    }

    /* 航线展开 */
    const routeMore = $("#route-more");
    if (routeMore) {
      routeMore.addEventListener("click", () => {
        routesExpanded = !routesExpanded;
        renderRoutes();
      });
    }

    /* 导航滚动状态 */
    if (typeof window.addEventListener === "function") {
      const onScroll = () => {
        const nav = $("#nav");
        if (nav) nav.classList.toggle("is-stuck", (window.scrollY || 0) > 40);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    initNavSearch();
  }

  /* ---------- 顶部搜索 + SimBrief ---------- */

  /* 站点机型 id → SimBrief 的机型代码 */
  const SB_TYPE = { a350: "A359", md11: "MD11", a320: "A320", b777: "B77W", b738: "B738" };

  /* 今天的机型：优先用今日机场推荐航线的第一条，没有就按日期轮 */
  function todayAircraftId() {
    const ap = todayAirport();
    const hit = ROUTES.find((r) => r.from[0] === ap.icao || r.to[0] === ap.icao);
    if (hit) return hit.aircraft;
    return AIRCRAFT[((dayIndex() % AIRCRAFT.length) + AIRCRAFT.length) % AIRCRAFT.length].id;
  }

  function simBriefUrl(orig, dest, aircraftId) {
    const q = new URLSearchParams();
    q.set("orig", orig);
    q.set("dest", dest);
    const t = SB_TYPE[aircraftId];
    if (t) q.set("type", t);
    return `https://dispatch.simbrief.com/options/custom?${q.toString()}`;
  }

  const CN_KEYS = (icao) => (typeof AIRPORT_CN !== "undefined" && AIRPORT_CN[icao]) || null;

  function searchAirports(raw, limit = 8) {
    const q = raw.trim();
    if (q.length < 2) return [];
    const up = q.toUpperCase();
    const rows = typeof AIRPORT_INDEX !== "undefined" ? AIRPORT_INDEX : [];
    const countryCode = COUNTRY_CN[q] || "";
    const hits = [];

    /* 先搜那 12 座精选：它们有中文名，而且有些小机场（库尔舍维尔、塞多纳）
       不在全量索引里（索引只收大、中型机场），不单独搜就会漏掉 */
    for (const ap of AIRPORTS) {
      let s = 0;
      if (ap.icao === up) s = 130;
      else if (ap.iata && ap.iata === up) s = 115;
      else if (ap.icao.startsWith(up)) s = 95;
      else if (
        ap.name.indexOf(q) !== -1 ||
        ap.city.indexOf(q) !== -1 ||
        ap.name.toUpperCase().indexOf(up) !== -1 ||
        ap.city.toUpperCase().indexOf(up) !== -1 ||
        (AIRPORT_EN[ap.icao] && AIRPORT_EN[ap.icao].toUpperCase().indexOf(up) !== -1)
      )
        s = 105;
      if (s) hits.push({ icao: ap.icao, iata: ap.iata, name: ap.name, city: ap.city, country: ap.country, score: s });
    }

    for (const [icao, iata, name, city, country] of rows) {
      let score = 0;
      if (icao === up) score = 120;
      else if (iata && iata === up) score = 110;
      else if (icao.startsWith(up)) score = 90;
      else if (iata && iata.startsWith(up)) score = 80;
      else if (name.toUpperCase().includes(up)) score = 50;
      else if (city && city.toUpperCase().includes(up)) score = 45;
      if (!score) {
        const cn = CN_KEYS(icao);
        if (cn && (cn[0].includes(q) || cn[1].includes(q))) score = 100;
      }
      if (!score) {
        const cnCities = CITY_CN_OF[icao];
        if (cnCities && cnCities.some((c) => c.indexOf(q) !== -1 || q.indexOf(c) !== -1)) score = 96;
      }
      if (!score && countryCode && country === countryCode) score = 62;
      if (score) hits.push({ icao, iata, name, city, country, score });
      if (hits.length > 600) break;
    }
    hits.sort((a, b) => b.score - a.score || a.icao.localeCompare(b.icao));
    const seen = new Set();
    return hits
      .filter((h) => {
        if (seen.has(h.icao)) return false;
        seen.add(h.icao);
        return true;
      })
      .slice(0, limit);
  }

  function initNavSearch() {
    const input = $("#nav-search-input");
    const panel = $("#search-panel");
    if (!input || !panel) return;

    let items = [];
    let active = -1;
    let timer = null;

    const close = () => {
      panel.hidden = true;
      active = -1;
    };

    const paint = (list) => {
      items = list;
      active = -1;
      const ap = todayAirport();
      const ac = todayAircraftId();

      if (!list.length) {
        panel.innerHTML =
          input.value.trim().length < 2
            ? `<div class="sp-empty">输入 ICAO、IATA、城市或机场名，比如 <b>ZULS</b> / <b>拉萨</b> / <b>Innsbruck</b>。</div>`
            : `<div class="sp-empty">没找到匹配的机场，试试 4 位 ICAO 代码。</div>`;
        panel.hidden = false;
        return;
      }

      panel.innerHTML =
        `<div class="sp-note">以今日机场 ${esc(ap.icao)} 为出发，机型 ${esc(
          aircraftName(ac)
        )} · 点结果直接开 SimBrief</div>` +
        list
          .map(
            (a, i) => `
          <div class="sp-item${i === 0 ? " is-active" : ""}" data-icao="${esc(a.icao)}" data-index="${i}">
            <span class="sp-icao">${esc(a.icao)}</span>
            <span class="sp-name">${esc(a.name)}<small>${esc(
              [a.city, a.country].filter(Boolean).join(" · ")
            )}</small></span>
            <span class="sp-act">SimBrief →</span>
          </div>`
          )
          .join("");
      panel.hidden = false;
      active = 0;
    };

    const open = (icao) => {
      const ap = todayAirport();
      const dest = icao === ap.icao ? ap.icao : icao;
      const url = simBriefUrl(ap.icao, dest, todayAircraftId());
      if (typeof window.open === "function") window.open(url, "_blank", "noopener");
      close();
    };

    const update = () => {
      paint(searchAirports(input.value));
    };

    input.addEventListener("input", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(update, 120);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 1) update();
    });

    input.addEventListener("keydown", (e) => {
      if (panel.hidden) {
        if (e.key === "Enter") update();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        [...panel.querySelectorAll(".sp-item")].forEach((el, i) =>
          el.classList.toggle("is-active", i === active)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const pick = items[active >= 0 ? active : 0];
        if (pick) open(pick.icao);
      } else if (e.key === "Escape") {
        close();
        input.blur();
      }
    });

    panel.addEventListener("click", (e) => {
      const row = e.target.closest(".sp-item");
      if (row) open(row.dataset.icao);
    });

    const onDocClick = (e) => {
      if (!panel.hidden && !panel.contains(e.target) && !input.closest(".nav-search").contains(e.target)) {
        close();
      }
    };
    if (typeof document.addEventListener === "function") document.addEventListener("click", onDocClick);

    /* 快捷键 "/" 聚焦搜索 */
    if (typeof document.addEventListener === "function") {
      document.addEventListener("keydown", (e) => {
        if (e.key === "/" && document.activeElement !== input) {
          e.preventDefault();
          input.focus();
        }
      });
    }
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initBackground();
    renderToday();
    renderAirportChips();
    renderChips();
    renderFleet();
    renderRoutes();
    renderScenery();
    bindEvents();
    /* 供 scripts/verify.mjs 自检用 */
    window.__dshSearch = searchAirports;
    window.__simBriefUrl = simBriefUrl;
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
