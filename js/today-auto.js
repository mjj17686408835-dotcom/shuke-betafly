/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-04",
  "generated": "2026-11-04T08:14:35.912Z",
  "icao": "EKCH",
  "picks": [
    {
      "icao": "EKCH",
      "role": "hub",
      "name": "Copenhagen Kastrup Airport",
      "city": "Copenhagen",
      "country": "DK",
      "elev": 5,
      "rwy": 3600,
      "score": 118.4,
      "weather": {
        "text": "晴",
        "temp": 6,
        "cloud": 0,
        "vis": 31720,
        "wind": 7,
        "isDay": true,
        "code": 0
      },
      "photo": "images/picks/2026-11-04/EKCH.jpg"
    },
    {
      "icao": "ZULS",
      "role": "challenge",
      "name": "Lhasa Gonggar International Airport",
      "city": "Shannan (Gonggar)",
      "country": "CN",
      "elev": 3570,
      "rwy": 4000,
      "score": 145.4,
      "weather": {
        "text": "大部晴朗",
        "temp": 15,
        "cloud": 30,
        "vis": 49520,
        "wind": 12,
        "isDay": true,
        "code": 1
      },
      "photo": "images/airports/ZULS.jpg"
    },
    {
      "icao": "GCHI",
      "role": "scenic",
      "name": "El Hierro Airport",
      "city": "El Hierro Island",
      "country": "ES",
      "elev": 31,
      "rwy": 1250,
      "score": 120.8,
      "weather": {
        "text": "大部晴朗",
        "temp": 20,
        "cloud": 27,
        "vis": 38400,
        "wind": 5,
        "isDay": true,
        "code": 1
      },
      "photo": "images/picks/2026-11-04/GCHI.jpg"
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
    "GCHI"
  ]
};
