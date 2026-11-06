/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-06",
  "generated": "2026-11-06T01:52:44.618Z",
  "icao": "RJTT",
  "picks": [
    {
      "icao": "RJTT",
      "role": "hub",
      "name": "Tokyo Haneda International Airport",
      "city": "Tokyo",
      "country": "JP",
      "elev": 11,
      "rwy": 3360,
      "score": 123,
      "weather": {
        "text": "晴",
        "temp": 21,
        "cloud": 0,
        "vis": 41740,
        "wind": 11,
        "isDay": true,
        "code": 0
      },
      "photo": "images/picks/2026-11-06/RJTT.jpg"
    },
    {
      "icao": "ZPPP",
      "role": "challenge",
      "name": "Kunming Changshui International Airport",
      "city": "Kunming",
      "country": "CN",
      "elev": 2104,
      "rwy": 4500,
      "score": 118.7,
      "weather": {
        "text": "大部晴朗",
        "temp": 18,
        "cloud": 46,
        "vis": 6580,
        "wind": 9,
        "isDay": true,
        "code": 1
      },
      "photo": "images/airports/ZPPP.jpg"
    },
    {
      "icao": "ESNS",
      "role": "scenic",
      "name": "Skellefteå Airport",
      "city": "Skellefteå",
      "country": "SE",
      "elev": 48,
      "rwy": 2520,
      "score": 91.7,
      "weather": {
        "text": "晴",
        "temp": -1,
        "cloud": 17,
        "vis": 72800,
        "wind": 10,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-06/ESNS.jpg"
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
    "ESNS"
  ]
};
