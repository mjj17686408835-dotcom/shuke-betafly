/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-16",
  "generated": "2026-11-16T01:27:37.343Z",
  "icao": "KORD",
  "picks": [
    {
      "icao": "KORD",
      "role": "hub",
      "name": "Chicago O'Hare International Airport",
      "city": "Chicago",
      "country": "US",
      "elev": 207,
      "rwy": 3962,
      "score": 105.8,
      "weather": {
        "text": "晴",
        "temp": 4,
        "cloud": 0,
        "vis": 31900,
        "wind": 5,
        "isDay": false,
        "code": 0
      },
      "photo": "images/picks/2026-11-16/KORD.jpg"
    },
    {
      "icao": "ZULS",
      "role": "challenge",
      "name": "Lhasa Gonggar International Airport",
      "city": "Shannan (Gonggar)",
      "country": "CN",
      "elev": 3570,
      "rwy": 4000,
      "score": 122.4,
      "weather": {
        "text": "晴",
        "temp": 3,
        "cloud": 1,
        "vis": 3920,
        "wind": 0,
        "isDay": true,
        "code": 0
      },
      "photo": "images/airports/ZULS.jpg"
    },
    {
      "icao": "CYDF",
      "role": "scenic",
      "name": "Deer Lake Airport",
      "city": "Deer Lake",
      "country": "CA",
      "elev": 22,
      "rwy": 2440,
      "score": 58.8,
      "weather": {
        "text": "阴",
        "temp": 2,
        "cloud": 100,
        "vis": 34400,
        "wind": 6,
        "isDay": false,
        "code": 3
      },
      "photo": "images/picks/2026-11-16/CYDF.jpg"
    }
  ],
  "history": [
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
    "CYQT",
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
    "CYDF"
  ]
};
