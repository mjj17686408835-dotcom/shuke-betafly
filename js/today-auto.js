/* 自动生成，别手改 —— 每天北京时间 06:00 由 GitHub Actions 重新生成。
   数据源 OurAirports（机场/跑道）+ Open-Meteo（天气）。重新生成：node scripts/build-today.mjs
   字段：date 北京日期 / picks 三个方案（role: hub 好飞 / challenge 挑战 / scenic 风景）
        weather 当时的天气 / history 最近推过的机场 */
const TODAY_AUTO = {
  "date": "2026-11-14",
  "generated": "2026-11-14T01:53:37.486Z",
  "icao": "VHHH",
  "picks": [
    {
      "icao": "VHHH",
      "role": "hub",
      "name": "Hong Kong International Airport",
      "city": "Hong Kong",
      "country": "HK",
      "elev": 9,
      "rwy": 3800,
      "score": 120.9,
      "weather": {
        "text": "晴",
        "temp": 23,
        "cloud": 9,
        "vis": 11800,
        "wind": 13,
        "isDay": true,
        "code": 0
      },
      "photo": "images/picks/2026-11-14/VHHH.jpg"
    },
    {
      "icao": "NZQN",
      "role": "challenge",
      "name": "Queenstown Airport",
      "city": "Queenstown",
      "country": "NZ",
      "elev": 357,
      "rwy": 1891,
      "score": 97.5,
      "weather": {
        "text": "多云",
        "temp": 18,
        "cloud": 56,
        "vis": 65300,
        "wind": 4,
        "isDay": true,
        "code": 2
      },
      "photo": "images/airports/NZQN.jpg"
    },
    {
      "icao": "CYVP",
      "role": "scenic",
      "name": "Kuujjuaq Airport",
      "city": "Kuujjuaq",
      "country": "CA",
      "elev": 39,
      "rwy": 1829,
      "score": 57.3,
      "weather": {
        "text": "阴",
        "temp": -2,
        "cloud": 100,
        "vis": 60940,
        "wind": 12,
        "isDay": false,
        "code": 3
      },
      "photo": "images/picks/2026-11-14/CYVP.jpg"
    }
  ],
  "history": [
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
    "CYVP"
  ]
};
