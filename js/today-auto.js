/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-20",
  "generated": "2026-11-20T02:43:43.480Z",
  "icao": "ZBAA",
  "picks": [
    {
      "icao": "ZBAA",
      "role": "hub",
      "name": "Beijing Capital International Airport",
      "city": "Beijing",
      "country": "CN",
      "elev": 35,
      "rwy": 3800,
      "score": 128.7,
      "weather": {
        "text": "晴",
        "temp": 4,
        "cloud": 5,
        "vis": 21360,
        "wind": 1,
        "isDay": true,
        "code": 0
      },
      "photo": "images/airports/ZBAA.jpg"
    },
    {
      "icao": "LXGB",
      "role": "challenge",
      "name": "Gibraltar Airport",
      "city": "Gibraltar",
      "country": "GI",
      "elev": 4,
      "rwy": 1829,
      "score": 102.9,
      "weather": {
        "text": "大部晴朗",
        "temp": 13,
        "cloud": 4,
        "vis": 27940,
        "wind": 6,
        "isDay": false,
        "code": 1
      },
      "photo": "images/airports/LXGB.jpg"
    },
    {
      "icao": "CYQU",
      "role": "scenic",
      "name": "Grande Prairie Airport",
      "city": "Grande Prairie",
      "country": "CA",
      "elev": 669,
      "rwy": 2591,
      "score": 80.6,
      "weather": {
        "text": "大部晴朗",
        "temp": -2,
        "cloud": 25,
        "vis": 38680,
        "wind": 10,
        "isDay": false,
        "code": 1
      },
      "photo": "images/picks/2026-11-20/CYQU.jpg"
    }
  ],
  "history": [
    "VIDP",
    "CYGK",
    "EGPN",
    "SUMU",
    "MGGT",
    "CYRT",
    "RPVM",
    "EGTK",
    "EKAH",
    "VHHH",
    "NZQN",
    "CYVP",
    "ZGGG",
    "CYRV",
    "PAJN",
    "KORD",
    "ZULS",
    "CYDF",
    "ZWWW",
    "VQPR",
    "EKCH",
    "VCBI",
    "HAAB",
    "CYQQ",
    "ZSSS",
    "KASE",
    "CYOA",
    "ZBAA",
    "LXGB",
    "CYQU"
  ]
};
