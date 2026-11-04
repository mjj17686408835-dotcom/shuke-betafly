# 🛩 舒克与贝塔

给模拟飞行群友用的信息站：**每天一座最美机场** + 同场推荐的航线 + 机型参考 + MSFS 2024 地景下载索引。
顶部还能直接搜全世界的机场，点一下就用 **SimBrief** 生成飞行计划。

纯静态站点，不需要服务器、不需要数据库、不需要登录。放到 GitHub Pages / Cloudflare Pages 上就能给群里所有人看。

![首屏预览](shot.png)

---

## 一、本地先看看效果

在这个目录（`flight-club`）下开一个终端，跑：

```
python -m http.server 8000
```

然后浏览器打开 <http://localhost:8000>。

> 直接双击 `index.html` 也能开，但用 http 服务更接近线上环境（尤其是以后加别的资源时）。

---

## 二、这个网站有什么

| 区块 | 内容 | 数据在哪 |
|---|---|---|
| 首屏 / 今日最美机场 | **每天北京时间 6 点按天气重新挑一座**：谁那儿晴、能见度好、没雨没雷暴，就推谁；满屏 2K 飞机照 + 大标题 + 当日实况，右下浮卡给出 ICAO、海拔、跑道、看点、进近方式 | `js/today-auto.js`（自动生成）→ 回退 `js/data.js` 的 `AIRPORTS` |
| 顶部机场搜索 | 输入 ICAO / IATA / 城市 / 机场名（中英文都行），选一条 → 用今日机场当出发地，在 SimBrief 里直接生成计划 | `js/airports-auto.js` + `js/app.js` |
| 机场实况天气 | 卡片和搜索结果上都带 **VFR/MVFR/IFR** 徽章、温度、风、能见度，**每天北京时间 8 点更新一次** | `js/weather-auto.js`（自动生成） |
| 今日推荐航线 | 从/到这座机场的 3 条推荐航线，不够就补顺路的 | `js/data.js` 的 `ROUTES` |
| 机场卡片墙 | 17 座机场（12 座全球经典 + 5 座国内），可按大洲筛、按名字/城市/ICAO 搜 | `js/data.js` 的 `AIRPORTS` |
| 机型机队 | A350 / MD-11F / A320 / B777 / B737-800 的照片、航程、巡航、载客、看点 | `js/data.js` 的 `AIRCRAFT` + `js/photos-auto.js` |
| 推荐飞行路径 | 21 条航线，默认显示 9 条，可按机型筛选、可展开全部 | `js/data.js` 的 `ROUTES` |
| MSFS 2024 地景 | 从 SceneryAddons 抓来的机场地景索引，点进去是原站下载页 | `js/scenery-auto.js` |

### 机场天气从哪来

`scripts/build-weather.mjs` 抓 **METAR**（机场实况报文），数据源是 `aviationweather.gov`（NOAA 的公开接口，
免费、不用 key，返回的就是各机场气象台发的原始报文），解析成温度、露点、风、能见度、修正海压、云况、飞行类别（VFR/MVFR/IFR/LIFR）。

> 关于 flightradar24：FR24 页面上显示的机场天气，本身就是 METAR 报文，它没有自己的气象源；
> 而且 FR24 有反爬和「禁止抓取」的条款。所以这里直接用 METAR 原始源——**数据同源，但更稳、也不违规**。

抓的范围：候选池 17 座 + 国内主要机场 45 座（因为不是每个机场都报 METAR，实际能拿到 20–30 座）。
结果写进 `js/weather-auto.js`，每天北京时间 08:00 由 `.github/workflows/update-weather.yml` 更新一次。

首屏那座如果没 METAR（比如拉萨 ZULS 不报），会退回早上 6 点挑机场时抓的 Open-Meteo 天气，所以永远有数据可显示。

### 今日机场是怎么挑的

`scripts/build-today.mjs` 会把候选池里每座机场的坐标发给 **Open-Meteo**（免费、不用 key），拿到当地实况天气，
然后打分：

- 云量越低越好（云量每 1% 扣 0.5 分）
- 能见度 30 km 以上加分，5 km 以下狠狠扣
- 有降水、起雾、下雪、雷暴按严重程度扣分（雷暴最狠，-70）
- 风超过 35 km/h 开始扣
- 白天加分，夜里扣一点（夜景虽美，但看不清地景）
- 分数接近时用日期做微扰，免得永远同一座；如果和昨天那座撞了，自动退一位换下一名

结果写进 `js/today-auto.js`，页面打开时优先用它；如果这个文件的日期不是今天（比如你本地没跑脚本），
就回退到「按日期轮换」的老逻辑，页面不会崩。

「每天 6 点」由 `.github/workflows/update-today.yml` 的 cron `0 22 * * *`（UTC 22:00 = 北京 06:00）触发，
跑完自动提交。**没部署到 GitHub 的话，这步不会发生**，本地看到的就是你最后一次手动跑的脚本结果
（手动跑：`node scripts/build-today.mjs`）。

### 搜索是怎么「介入 SimBrief」的

搜到机场后，点那一条，浏览器会新开一个 SimBrief 的预填页面，出发地填的是**今日机场**，目的地是你选的机场，机型跟着今日机场的推荐机型走
（比如今天推的是朱诺、推荐 737-8，那你搜「拉萨」就会开一份 `PAJN → ZULS`、机型 B738 的计划草稿）。

SimBrief 那边仍然要登录你自己的账号——这一步跳不过去，也不需要跳，计划生成后就是你的。

**两处搜索，查的是同一份库：**

| 位置 | 输入什么 | 结果形态 |
|---|---|---|
| 导航栏右侧 | ICAO / IATA / 城市 / 机场名 | 下拉候选，点一条直接开 SimBrief |
| 「下一站，飞哪儿？」上方的搜索条 | 同上 | 把结果铺成卡片网格，会一起筛掉下方的说明文案 |

两处都查 **4508 座机场**（大型 + 中型，有定期航班的），支持：

- 4 位 ICAO：`ZBAA`
- 3 位 IATA：`PEK`
- 中文城市 / 机场名：`北京`、`拉萨`、`浦东`
- 中文国家名：`中国`、`日本`
- 英文名：`Courchevel`、`Innsbruck`

精选那 12 座点进去是带实景图的大卡片；其余是**轻量卡片**（没有图片，只有 ICAO / 名称 / IATA / 国家 + `SimBrief ↗`），
点一下照样直接跳 SimBrief——全量机场不可能每座都配图，配了也传不动。

---

## 三、日常维护（改内容）

**加机场**：打开 `js/data.js`，往 `AIRPORTS` 数组里加一条，照着现有的抄，字段：

```js
{ icao:"ZBAA", iata:"PEK", name:"北京首都", city:"北京", country:"中国", region:"亚洲",
  elev:116, runway:"18L/36R · 3800m", theme:["#1b2a4a","#0e1626"],
  why:"一句话说为什么美", approach:"推荐进近方式", difficulty:"简单/中等/困难", best:"最佳季节或时段" }
```

> `theme` 是卡片背景的两段渐变色，随便挑一对同色系的深色就行。
> 这里的 12 座是「精选」，顶部搜索用的是全量机场索引，不冲突。

**加航线**：往 `ROUTES` 里加，`aircraft` 要填 `AIRCRAFT` 里的 id（`a350` / `md11` / `a320` / `b777` / `b738`）：

```js
{ aircraft:"a320", from:["ZUUU","成都双流"], to:["ZULS","拉萨贡嘎"], dist:680, time:"1h50m", note:"进藏经典线路" }
```

**改机型信息**：`AIRCRAFT` 里改 `range`（航程）、`cruise`（巡航）、`tip`（一句话点评）。

**换首屏背景图**：把 2K（2560 宽）以上的图丢进 `images/`，再在 `js/backgrounds.js` 里加一行：

```js
{ src:"images/我的图.jpg", credit:"摄影师名", link:"https://图片来源地址" }
```

页面每 8 秒自动切一张，每天从不同的图开始。没有图的时候会自动退回用机型照片垫着。

**换机场卡片图**：机场网格里每张卡片的图是按 ICAO 找的，路径固定为 `images/airports/{ICAO}.jpg`（比如拉萨是 `images/airports/ZULS.jpg`）。

- 想换某座机场的图：直接把同名文件覆盖掉就行，**900×675（4:3）** 最合适。
- 想给某座机场指定别的路径：在 `js/data.js` 那条里加 `photo: "images/xxx.jpg"`；加 `photo: false` 就是不用图、退回纯色渐变。
- 想整批重新裁：跑 `python scripts/gen-airport-photos.py`（需要 Pillow），它按脚本里的 `PLAN` 表把 `images/` 下的原图裁成 900×675 写进 `images/airports/`，表里第四个数字是亮度倍数——窗户、逆光那种偏暗的图调到 1.2 左右。
- 想让它自己抓真实机场照片：见第四节 `fetch-airport-photos.mjs`，配着 GitHub Actions 每周自动换。

改完刷新浏览器就能看到，不用构建、不用编译。

---

## 四、自动生成的数据文件

这些文件是脚本抓/生成的，**不用手写**，但可以直接改（下次跑脚本会被覆盖）。

### 地景索引 `js/scenery-auto.js`

```
node scripts/fetch-scenery.mjs --pages=3
```

去 `https://sceneryaddons.org/category/msfs-airport/` 抓第 1~3 页里属于 MSFS 2024 的机场，重新生成这个文件。`--pages` 想抓多少页就改多少。

### 飞机照片 `js/photos-auto.js`

```
node scripts/fetch-photos.mjs
```

按 `fetch-photos.mjs` 里那份注册号清单，去 planespotters 的公开接口查每架飞机的照片，生成带摄影师署名的图片索引。换机型/换航空公司时，改脚本顶部那个数组再跑一次。

### 全球机场索引 `js/airports-auto.js`

```
node scripts/build-airport-index.mjs
```

从 OurAirports 的公开数据里筛出 4508 座有定期航班的机场（大型 + 中型），生成顶部搜索用的索引，顺便给 `data.js` 里那 12 座精选机场配上中文名。
第一次跑要下十几 MB，之后 24 小时内用缓存。

### 核对机场硬数据

```
node scripts/check-airports.mjs
```

拿 OurAirports 的数据比一遍 `AIRPORTS` 里的标高和跑道长度，不一致的会列出来。`data.js` 里的数字已经按它核对过一轮。

### 自动换机场卡片图 `scripts/fetch-airport-photos.mjs`

机场卡片的图可以自动抓，不用自己找：

```
node scripts/fetch-airport-photos.mjs              # 抓全部 12 座
node scripts/fetch-airport-photos.mjs --only=ZULS  # 只抓一座
node scripts/fetch-airport-photos.mjs --dry        # 只看会抓到什么，不落盘
```

图源是 **Wikimedia Commons**（免费、可商用），按每座机场的英文名搜图，只挑宽度 ≥1000 的 jpeg，自动排除地图、logo、航图之类的文件。抓到的存成 `images/airports/{ICAO}.jpg`，覆盖旧的。

**任何一步失败就跳过那座机场，旧图原样保留**，不会把页面搞坏。

> 这个脚本在本地多半跑不通——`commons.wikimedia.org` 在国内经常连不上。放到 GitHub 上就正常了，所以配套加了 `.github/workflows/update-airport-photos.yml`：每周二早上 6 点（北京）自动跑一次，也可以在 Actions 页面手动点 `Run workflow`，还能只指定某一座重抓。

### 自检

```
node scripts/verify.mjs
```

不用开浏览器，把页面渲染一遍，检查各大区块有没有正常生成内容、今日机场和日期对不对、搜索能不能搜到、SimBrief 链接拼得对不对。

---

## 五、部署到 GitHub Pages（免费，不用服务器）

### 1. 建仓库

注册/登录 GitHub → 右上角 `+` → **New repository** → 名字随便（比如 `shuke-beita`）→ 选 **Public** → **Create repository**。

### 2. 上传文件

仓库页点 **uploading an existing file**（或 `Add file` → `Upload files`），把这个目录里的这些东西拖进去：

```
index.html
css/
js/
images/           ← 首屏大图，必须传，不然背景是空的
.github/          ← 想让地景自动更新就带上，不想就跳过
```

> ⚠️ 拖的是 `flight-club` **里面的内容**，不是 `flight-club` 文件夹本身。上传后仓库首页应该直接看到 `index.html`。
>
> `scripts/` 和 `README.md` 不用传，它们只在你自己电脑上跑。

`.github` 是隐藏文件夹，Windows 资源管理器里要先勾「显示隐藏的项目」才能看到。

点 **Commit changes**。

### 3. 开启 Pages

仓库 → **Settings** → 左侧 **Pages** → Source 选 **Deploy from a branch** → Branch 选 `main`、目录选 `/ (root)` → **Save**。

等 1~2 分钟，页面会显示地址：

```
https://你的用户名.github.io/shuke-beita/
```

这就是能发到群里的网址了。以后改内容只要在网页上编辑文件再 Commit，1 分钟后线上就更新。

### 4. 关于访问速度

大陆访问 `github.io` 有时慢或者打不开。如果群友反馈打不开，可以换 **Cloudflare Pages**（同样免费、同样拖文件夹上传、国内一般更稳）：<https://pages.cloudflare.com>。

> 首屏那几张图加起来约 2 MB。想更快可以把图压到 1600 宽再传，画质基本看不出来。

---

## 六、让地景索引每天自动更新（可选）

仓库里带了 `.github/workflows/update-scenery.yml`，它每天北京时间 06:00 自动跑一次抓取脚本，有新条目就自动提交。

前提：文件已经上传到仓库（含 `.github` 目录），且仓库是 Public。

---

## 七、文件结构

```
flight-club/
├── index.html              页面结构
├── css/style.css           样式（沉浸式大图 + 卡片网格、响应式）
├── js/data.js              ★ 机场 / 航线 / 机型数据（主要改这里）
├── js/backgrounds.js       ★ 首屏背景图清单（换图改这里）
├── js/airports-auto.js     全球机场索引（脚本生成）
├── js/photos-auto.js       飞机照片索引（脚本生成）
├── js/scenery-auto.js      地景索引（脚本生成）
├── js/app.js               渲染逻辑（日期轮换、搜索、SimBrief、筛选、分页、背景轮播）
├── images/                 首屏背景大图（2560 宽）
├── images/airports/        机场卡片图（900×675，文件名 = ICAO.jpg）
├── scripts/build-airport-index.mjs  生成机场搜索索引
├── scripts/gen-airport-photos.py    批量裁机场卡片图（需要 Pillow）
├── scripts/fetch-airport-photos.mjs 自动抓机场实景照（Commons）
├── scripts/fetch-scenery.mjs        抓 SceneryAddons
├── scripts/fetch-photos.mjs         抓飞机照片
├── scripts/check-airports.mjs       核对机场硬数据
├── scripts/verify.mjs               无浏览器自检
├── .github/workflows/update-scenery.yml         每日自动更新地景
├── .github/workflows/update-airport-photos.yml  每周自动换机场图
└── shot.png                首屏预览图（可以删）
```

---

## 八、图片来源与版权

- **首屏背景**用的是 [Pexels](https://www.pexels.com/) 的免费图（可商用、无需署名，这里还是标了出处）。都是 2560 宽的原图，不是缩略图放大。想换成自己的照片直接改 `js/backgrounds.js`。
- **机场卡片图**同样来自 Pexels，从原图上裁 4:3 到 900×675；机队照片来自 [planespotters.net](https://www.planespotters.net/) 的公开照片接口，页面上标了摄影师，这是他们接口的使用要求，别删。他们的接口只给 420×280 的缩略图，所以机队卡片上的图偏小——卡片就这么大，够用。
- **机场地景**链接全部指向 SceneryAddons 原站，本站只做索引，不转存文件。
- **标高 / 跑道长度**是公共领域的 OurAirports 数据核对过的；`why` / `approach` / `difficulty` / `best` 是人工写的推荐文案，「最美机场」是模拟飞行社区里公认的经典挑战机场，不是评选取证。
- **飞行计划**由 [SimBrief](https://dispatch.simbrief.com) 生成，本站只是帮你把出发地/目的地/机型填好，不存任何账号信息。

---

## 九、下一步可以加的东西

- 机场卡片换成实拍封面图（现在是渐变色块），视觉更接近参考设计
- 搜索结果里显示机场的跑道长度/标高，选之前心里有数
- 航线详情页：每条的航路点、推荐巡航高度、天气提示
- 群友投稿入口（表单 → 提交到 GitHub Issue）
- 每日推送直接发到 QQ 群（需要一台常开的小机器或 GitHub Actions 定时调机器人接口）
