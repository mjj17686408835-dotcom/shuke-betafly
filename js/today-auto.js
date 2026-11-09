/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-09",
  "generated": "2026-11-09T01:17:44.975Z",
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
      "score": 131,
      "weather": {
        "text": "晴",
        "temp": 3,
        "cloud": 0,
        "vis": 17500,
        "wind": 7,
        "isDay": true,
        "code": 0
      },
      "photo": "images/airports/ZBAA.jpg"
    },
    {
      "icao": "CYXC",
      "role": "challenge",
      "name": "Cranbrook/Canadian Rockies International Airport",
      "city": "Cranbrook",
      "country": "CA",
      "elev": 939,
      "rwy": 1829,
      "score": 107.6,
      "weather": {
        "text": "晴",
        "temp": 5,
        "cloud": 0,
        "vis": 36300,
        "wind": 12,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-09/CYXC.jpg"
    },
    {
      "icao": "KSSI",
      "role": "scenic",
      "name": "St Simons Island Airport",
      "city": "St Simons Island",
      "country": "US",
      "elev": 6,
      "rwy": 1702,
      "score": 104.4,
      "weather": {
        "text": "晴",
        "temp": 17,
        "cloud": 10,
        "vis": 18200,
        "wind": 10,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-09/KSSI.jpg"
    }
  ],
  "history": [
    "FAKM",
    "UNIS",
    "YBHM",
    "ZLIC",
    "UCFL",
    "UACC",
    "ZBDS",
    "ZMBH",
    "FVFA",
    "ZWWW",
    "VQPR",
    "PAJN",
    "ZGGG",
    "KASE",
    "PAJN",
    "EKCH",
    "ZULS",
    "GCHI",
    "RJTT",
    "ZPPP",
    "ESNS",
    "ZSSS",
    "HAAB",
    "KOAK",
    "VGHS",
    "KSBA",
    "CYOA",
    "ZBAA",
    "CYXC",
    "KSSI"
  ]
};
