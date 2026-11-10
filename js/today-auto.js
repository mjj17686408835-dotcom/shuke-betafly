/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-10",
  "generated": "2026-11-10T03:52:15.906Z",
  "icao": "VNKT",
  "picks": [
    {
      "icao": "VNKT",
      "role": "hub",
      "name": "Tribhuvan International Airport",
      "city": "Kathmandu",
      "country": "NP",
      "elev": 1338,
      "rwy": 3350,
      "score": 118.4,
      "weather": {
        "text": "晴",
        "temp": 20,
        "cloud": 2,
        "vis": 12760,
        "wind": 5,
        "isDay": true,
        "code": 0
      },
      "photo": "images/airports/VNKT.jpg"
    },
    {
      "icao": "LGSK",
      "role": "challenge",
      "name": "Skiathos Island National Airport",
      "city": "Skiathos",
      "country": "GR",
      "elev": 16,
      "rwy": 1628,
      "score": 75.6,
      "weather": {
        "text": "多云",
        "temp": 13,
        "cloud": 74,
        "vis": 23900,
        "wind": 6,
        "isDay": false,
        "code": 2
      },
      "photo": "images/picks/2026-11-10/LGSK.jpg"
    },
    {
      "icao": "CYQT",
      "role": "scenic",
      "name": "Thunder Bay International Airport",
      "city": "Thunder Bay",
      "country": "CA",
      "elev": 199,
      "rwy": 2231,
      "score": 80.9,
      "weather": {
        "text": "大部晴朗",
        "temp": 2,
        "cloud": 31,
        "vis": 14600,
        "wind": 10,
        "isDay": false,
        "code": 1
      },
      "photo": "images/picks/2026-11-10/CYQT.jpg"
    }
  ],
  "history": [
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
    "KSSI",
    "VNKT",
    "LGSK",
    "CYQT"
  ]
};
