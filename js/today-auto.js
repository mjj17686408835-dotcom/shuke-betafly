/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-24",
  "generated": "2026-11-24T05:39:50.755Z",
  "icao": "OMDB",
  "picks": [
    {
      "icao": "OMDB",
      "role": "hub",
      "name": "Dubai International Airport",
      "city": "Dubai",
      "country": "AE",
      "elev": 19,
      "rwy": 4447,
      "score": 113,
      "weather": {
        "text": "晴",
        "temp": 26,
        "cloud": 0,
        "vis": 27920,
        "wind": 6,
        "isDay": true,
        "code": 0
      },
      "photo": "images/picks/2026-11-24/OMDB.jpg"
    },
    {
      "icao": "KSNA",
      "role": "challenge",
      "name": "John Wayne Orange County International Airport",
      "city": "Santa Ana",
      "country": "US",
      "elev": 17,
      "rwy": 1737,
      "score": 102.9,
      "weather": {
        "text": "晴",
        "temp": 15,
        "cloud": 16,
        "vis": 31200,
        "wind": 6,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-24/KSNA.jpg"
    },
    {
      "icao": "CYFB",
      "role": "scenic",
      "name": "Iqaluit Airport",
      "city": "Iqaluit",
      "country": "CA",
      "elev": 34,
      "rwy": 2623,
      "score": 99.3,
      "weather": {
        "text": "晴",
        "temp": -23,
        "cloud": 0,
        "vis": 88080,
        "wind": 13,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-24/CYFB.jpg"
    }
  ],
  "history": [
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
    "CYQU",
    "VNKT",
    "KEYW",
    "LGSK",
    "OMDB",
    "KSNA",
    "CYFB"
  ]
};
