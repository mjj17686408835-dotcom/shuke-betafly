/* =========================================================
   飞行俱乐部 · 数据文件
   所有内容集中在这里，改这个文件就能改站点的推荐内容。
   ========================================================= */

/* ---------- 机队 ---------- */
const AIRCRAFT = [
  {
    id: "a350",
    name: "Airbus A350-900",
    short: "A350",
    role: "长程宽体",
    range: "8,100 nm",
    cruise: "FL390 / M0.85",
    engines: "2 × RR Trent XWB-84",
    pax: "300–350",
    tip: "长途巡航用 STEP CLIMB 逐步爬升更省油；A350 的 OANS 让高原与山区机场的进近规划轻松很多。"
  },
  {
    id: "md11",
    name: "McDonnell Douglas MD-11F",
    short: "MD-11F",
    role: "三发货机",
    range: "6,500 nm",
    cruise: "FL350 / M0.82",
    engines: "3 × PW4460 / CF6-80C2",
    pax: "货运（≈ 90 t）",
    tip: "三发构型重心靠后，落地时注意不要拉飘；MD-11 的自动油门响应偏慢，手飞进近更稳。"
  },
  {
    id: "a320",
    name: "Airbus A320neo",
    short: "A320",
    role: "中短程窄体",
    range: "3,500 nm",
    cruise: "FL360 / M0.78",
    engines: "2 × LEAP-1A / PW1100G",
    pax: "150–180",
    tip: "短跑道和高原机场是 A320 的主场，但记得按气温和标高修正 V1/VR，别照抄海平面数据。"
  },
  {
    id: "b777",
    name: "Boeing 777-300ER",
    short: "B777",
    role: "长程宽体",
    range: "7,370 nm",
    cruise: "FL380 / M0.84",
    engines: "2 × GE90-115B",
    pax: "350–400",
    tip: "777 的襟翼收放逻辑和空客相反，飞惯 A 系的人第一次飞容易在起飞后误收襟翼，注意 PF/PM 分工。"
  },
  {
    id: "b738",
    name: "Boeing 737-800",
    short: "B737-8",
    role: "中短程窄体",
    range: "2,935 nm",
    cruise: "FL370 / M0.78",
    engines: "2 × CFM56-7B",
    pax: "160–190",
    tip: "737 没有自动推力，全程手控油门是常态；短跑道落地多用 FLAPS 30 加反推，别急着踩刹车。"
  }
];

/* ---------- 最美机场池（每日轮换） ---------- */
const AIRPORTS = [
  {
    icao: "ZULS",
    iata: "LXA",
    name: "拉萨贡嘎",
    city: "拉萨",
    country: "中国",
    region: "亚洲",
    elev: "3,570 m / 11,713 ft",
    runway: "09/27 · 4,000 m",
    theme: ["#2b5876", "#4e4376"],
    why: "雅鲁藏布江河谷里的一条 4,000 米跑道，四周是 5,000 米级的山。起降时舷窗外是整条喜马拉雅，晴天能看见南迦巴瓦。",
    approach: "RNAV 09 进近，注意高标高带来的真空速偏大；复飞梯度要按 3.3% 以上规划，别按平原习惯。",
    difficulty: "高",
    best: "10 月–次年 4 月，能见度最好"
  },
  {
    icao: "VQPR",
    iata: "PBH",
    name: "帕罗",
    city: "帕罗",
    country: "不丹",
    region: "亚洲",
    elev: "2,244 m / 7,364 ft",
    runway: "15/33 · 2,265 m",
    theme: ["#134e5e", "#71b280"],
    why: "全世界最难进的机场之一。跑道藏在喜马拉雅褶皱里，进近要贴着山谷做连续转弯，落地前 30 秒才看得见跑道。",
    approach: "RNP AR 15 进近，只有持特殊资质的机组能飞。山谷风切变强，建议先看一遍真实驾驶舱视频再上手。",
    difficulty: "极高",
    best: "3–5 月、9–11 月"
  },
  {
    icao: "LOWI",
    iata: "INN",
    name: "因斯布鲁克",
    city: "因斯布鲁克",
    country: "奥地利",
    region: "欧洲",
    elev: "581 m / 1,906 ft",
    runway: "08/26 · 2,000 m",
    theme: ["#3a7bd5", "#00d2ff"],
    why: "阿尔卑斯山正中间的一条跑道。08 方向进近要沿因河河谷下降，两侧山壁几乎贴着机翼，落地后滑行时能看到滑雪场。",
    approach: "LOC 08 或 RNAV 08，注意山谷里的下沉气流；冬季跑道常有污染，LANDING DISTANCE 要加修正。",
    difficulty: "高",
    best: "12 月–3 月，雪山最完整"
  },
  {
    icao: "LXGB",
    iata: "GIB",
    name: "直布罗陀",
    city: "直布罗陀",
    country: "英国海外领土",
    region: "欧洲",
    elev: "5 m / 15 ft",
    runway: "09/27 · 1,829 m",
    theme: ["#f7971e", "#ffd200"],
    why: "跑道横穿一条城市公路，尽头直接扎进地中海。落地那一刻你会怀疑自己是不是要掉进海里。",
    approach: "RNAV 09 进近，跑道短、侧风大，注意 09 方向的海面阵风；复飞要立刻右转避开山体。",
    difficulty: "高",
    best: "5–9 月，海面颜色最好看"
  },
  {
    icao: "KSEZ",
    iata: "SDX",
    name: "塞多纳",
    city: "塞多纳",
    country: "美国",
    region: "北美",
    elev: "1,478 m / 4,830 ft",
    runway: "03/21 · 1,564 m",
    theme: ["#c94b4b", "#4b134f"],
    why: "建在红色砂岩台地上的机场，跑道两头都是悬崖。黄昏时分整片岩壁会烧成橘红色，是 MSFS 里最出片的场景之一。",
    approach: "RNAV 03 进近，台地边缘有强烈下沉气流，进近时保持高一点；建议用 C172/DA62 这类小飞机。",
    difficulty: "中",
    best: "日落前 1 小时"
  },
  {
    icao: "KASE",
    iata: "ASE",
    name: "阿斯彭",
    city: "阿斯彭",
    country: "美国",
    region: "北美",
    elev: "2,384 m / 7,820 ft",
    runway: "15/33 · 2,440 m",
    theme: ["#1e3c72", "#2a5298"],
    why: "落基山深处的滑雪小镇机场，四周全是 4,000 米级山峰。冬季进场时整条山谷都是白的，落地像扎进雪里。",
    approach: "LOC/DME 15 进近，山区乱流和风切变是常态；高标高，注意 GS 偏大、减速距离变长。",
    difficulty: "高",
    best: "1–3 月"
  },
  {
    icao: "PAJN",
    iata: "JNU",
    name: "朱诺",
    city: "朱诺",
    country: "美国",
    region: "北美",
    elev: "6 m / 21 ft",
    runway: "08/26 · 2,700 m",
    theme: ["#0f2027", "#2c5364"],
    why: "阿拉斯加峡湾里的机场，跑道一侧是冰川，一侧是山。夏天日落极晚，飞进来时天光还亮着，海面像镜子。",
    approach: "LDA 08 进近是经典科目，最后要目视绕开山体做侧向修正；冬季结冰条件下注意不要用满襟翼。",
    difficulty: "中高",
    best: "5–8 月（日落晚、光好）"
  },
  {
    icao: "VNKT",
    iata: "KTM",
    name: "加德满都",
    city: "加德满都",
    country: "尼泊尔",
    region: "亚洲",
    elev: "1,338 m / 4,390 ft",
    runway: "02/20 · 3,350 m",
    theme: ["#8e2de2", "#4a00e0"],
    why: "喜马拉雅南麓的门户。02 方向进近时，正前方就是整条喜马拉雅山脉，天气好能看到珠峰。",
    approach: "RNAV 02 进近，山谷地形限制雷达引导；注意高原机场的进场高度和复飞程序。",
    difficulty: "中高",
    best: "10–12 月，空气最通透"
  },
  {
    icao: "NZQN",
    iata: "ZQN",
    name: "皇后镇",
    city: "皇后镇",
    country: "新西兰",
    region: "大洋洲",
    elev: "358 m / 1,174 ft",
    runway: "05/23 · 1,891 m",
    theme: ["#00b4db", "#0083b0"],
    why: "南阿尔卑斯山脚下的湖景机场。23 方向进近要沿湖面下降，右侧是 Remarkables 山脉，视觉冲击力极强。",
    approach: "RNP 23 进近，山谷地形导致进近路径受限制；注意湖面的视觉高度错觉，别飞低了。",
    difficulty: "高",
    best: "12–2 月（南半球夏天）"
  },
  {
    icao: "TNCM",
    iata: "SXM",
    name: "圣马丁",
    city: "菲利普斯堡",
    country: "荷属圣马丁",
    region: "加勒比",
    elev: "4 m / 13 ft",
    runway: "10/28 · 2,300 m",
    theme: ["#f12711", "#f5af19"],
    why: "著名的「海滩机场」。10 方向进近时飞机要从游客头顶几十米掠过，跑道尽头就是玛黑海滩。",
    approach: "RNAV 10 进近，最后进近段短、下滑角偏陡，注意不要越界；侧风时海面乱流明显。",
    difficulty: "高",
    best: "12–4 月（旱季）"
  },
  {
    icao: "LPMA",
    iata: "FNC",
    name: "马德拉",
    city: "丰沙尔",
    country: "葡萄牙",
    region: "欧洲",
    elev: "58 m / 190 ft",
    runway: "05/23 · 2,781 m",
    theme: ["#43cea2", "#185a9d"],
    why: "一半跑道架在海上的高架桥上，进近要贴着悬崖转弯。落地后从舷窗看，跑道尽头就是大西洋。",
    approach: "RNAV 05 进近，风切变和下沉气流出名；23 方向有地形限制的复飞程序，务必预演。",
    difficulty: "极高",
    best: "4–10 月"
  },
  {
    icao: "LFLJ",
    iata: "CVF",
    name: "库尔舍维尔",
    city: "库尔舍维尔",
    country: "法国",
    region: "欧洲",
    elev: "2,006 m / 6,582 ft",
    runway: "04/22 · 537 m",
    theme: ["#e96443", "#904e95"],
    why: "阿尔卑斯滑雪场机场，跑道只有 537 米，而且带 18.5% 的坡度——世界上坡度最大的机场之一。落地像在往山上撞。",
    approach: "只有单向 04 进近，无仪表程序，纯目视。必须用 PC-6、C172 这类短距起降机，且要练熟。",
    difficulty: "极高",
    best: "12–3 月"
  },
  {
    icao: "ZBAA",
    iata: "PEK",
    name: "北京首都",
    city: "北京",
    country: "中国",
    region: "亚洲",
    elev: "35 m / 116 ft",
    runway: "18L/36R · 3,800 m",
    theme: ["#3a4a6b", "#161d2e"],
    why: "T3 那座大红柱子的航站楼，落地前能看见整片华北平原在底下铺开，晴天时天际线一直拉到西山。",
    approach: "36R 是主降跑道，长五边对正后能看见整座城市；冬天有偏北大风时要留意侧风修正。",
    difficulty: "简单",
    best: "9–11 月"
  },
  {
    icao: "ZSSS",
    iata: "SHA",
    name: "上海虹桥",
    city: "上海",
    country: "中国",
    region: "亚洲",
    elev: "3 m / 10 ft",
    runway: "18L/36R · 3,400 m",
    theme: ["#2f5d63", "#102026"],
    why: "离市区只有 13 公里，18R 进近时飞机擦着虹桥商务区的楼顶过去，傍晚能看见整条黄浦江的反光。",
    approach: "18R ILS 进近，最后阶段楼群很近，视觉压迫感强；36L 起飞爬升后左转，能俯瞰外滩。",
    difficulty: "简单",
    best: "3–5 月、10–11 月"
  },
  {
    icao: "ZGGG",
    iata: "CAN",
    name: "广州白云",
    city: "广州",
    country: "中国",
    region: "亚洲",
    elev: "15 m / 49 ft",
    runway: "02R/20L · 3,800 m",
    theme: ["#4a5f3a", "#151f14"],
    why: "珠三角的南大门，夏季午后雷雨云一柱一柱地立在天边，飞进去像在穿瀑布。",
    approach: "02L 常用，雨季进近前要看清雷达回波；台风季侧风大，20R 落地会贴着珠江口。",
    difficulty: "中等",
    best: "10–12 月"
  },
  {
    icao: "ZPPP",
    iata: "KMG",
    name: "昆明长水",
    city: "昆明",
    country: "中国",
    region: "亚洲",
    elev: "2,103 m / 6,900 ft",
    runway: "04/22 · 4,500 m",
    theme: ["#6b5a3a", "#1e1810"],
    why: "高原上的长跑道，四周是喀斯特石林和红土；冬天从北面下来时云海正好压在机场上面。",
    approach: "高原机场，进近速度要加，03 落地前有一段山谷气流；春季午后阵风明显。",
    difficulty: "中等",
    best: "11–2 月"
  },
  {
    icao: "ZWWW",
    iata: "URC",
    name: "乌鲁木齐地窝堡",
    city: "乌鲁木齐",
    country: "中国",
    region: "亚洲",
    elev: "648 m / 2,126 ft",
    runway: "07/25 · 3,600 m",
    theme: ["#7a5a2e", "#221708"],
    why: "往西一抬头就是天山，秋天山坡是金黄色的，飞乌鲁木齐的航路上能看见整条天山山脉。",
    approach: "07 进近对着天山北坡，晴天地形清楚；冬季有雾时要等 RVR 达标。",
    difficulty: "简单",
    best: "9–10 月"
  }
];

/* ---------- 推荐航线 ----------
   from/to 格式：[ICAO, 机场名]
   dist 单位 nm，time 为轮挡时间（含滑行）
*/
const ROUTES = [
  /* ---- A350 ---- */
  {
    aircraft: "a350",
    from: ["ZSPD", "上海浦东"],
    to: ["LFPG", "巴黎戴高乐"],
    dist: 4950,
    time: "11h 50m",
    note: "东航 A350 的经典洲际线。穿越西伯利亚时打开舱外视角，云海和极光（冬季）都值得截图。"
  },
  {
    aircraft: "a350",
    from: ["VHHH", "香港"],
    to: ["KLAX", "洛杉矶"],
    dist: 6300,
    time: "12h 40m",
    note: "跨太平洋长航线，考验长航程燃油管理。建议在 FL390 做一次 step climb，落地前看加州海岸线。"
  },
  {
    aircraft: "a350",
    from: ["OMDB", "迪拜"],
    to: ["NZAA", "奥克兰"],
    dist: 7700,
    time: "15h 20m",
    note: "14 小时+ 的超长航段，适合挂机巡航党。途中会掠过印度洋，夜间几乎没有地面灯光。"
  },

  /* ---- MD-11F ---- */
  {
    aircraft: "md11",
    from: ["ZSPD", "上海浦东"],
    to: ["EDDF", "法兰克福"],
    dist: 4800,
    time: "10h 10m",
    note: "经典三发货机洲际货运线。MD-11F 满载时爬升慢，起飞后别急着收襟翼，按 V2+15 稳住。"
  },
  {
    aircraft: "md11",
    from: ["KLAX", "洛杉矶"],
    to: ["PHNL", "檀香山"],
    dist: 2220,
    time: "5h 40m",
    note: "FedEx 的太平洋货运支线。落地 PHNL 前会绕岛飞行，钻石头山和威基基海滩在左舷。"
  },
  {
    aircraft: "md11",
    from: ["EDDF", "法兰克福"],
    to: ["KJFK", "纽约肯尼迪"],
    dist: 3350,
    time: "7h 30m",
    note: "跨大西洋夜航。MD-11 的自动油门响应慢，进近时建议断开 A/T 手控，落地更稳。"
  },

  /* ---- A320 ---- */
  {
    aircraft: "a320",
    from: ["ZUUU", "成都双流"],
    to: ["ZULS", "拉萨贡嘎"],
    dist: 690,
    time: "2h 05m",
    note: "高原航线入门首选。A320 在 3,570 米标高的性能余量很小，起飞前务必按气温查 RTOW。"
  },
  {
    aircraft: "a320",
    from: ["VNKT", "加德满都"],
    to: ["VQPR", "帕罗"],
    dist: 220,
    time: "1h 00m",
    note: "不丹皇家航空的真实航线，A320 是唯一能定期飞帕罗的喷气机。RNP AR 进近，手飞更有味道。"
  },
  {
    aircraft: "a320",
    from: ["LOWW", "维也纳"],
    to: ["LOWI", "因斯布鲁克"],
    dist: 220,
    time: "1h 05m",
    note: "阿尔卑斯山谷进近的经典短途。08 方向沿河谷下降，两侧山壁贴得很近，视觉压迫感十足。"
  },
  {
    aircraft: "a320",
    from: ["EGLL", "伦敦希思罗"],
    to: ["LXGB", "直布罗陀"],
    dist: 950,
    time: "2h 45m",
    note: "落地跑道尽头就是地中海。跑道只有 1,829 米，反推和刹车要提前规划。"
  },
  {
    aircraft: "a320",
    from: ["LPPT", "里斯本"],
    to: ["LPMA", "马德拉"],
    dist: 520,
    time: "2h 00m",
    note: "TAP 的真实航线。马德拉的侧风和下沉气流很凶，建议先用晴天飞几次再挑战大风天。"
  },
  {
    aircraft: "a320",
    from: ["NZAA", "奥克兰"],
    to: ["NZQN", "皇后镇"],
    dist: 560,
    time: "2h 00m",
    note: "新西兰航空的湖景进近。23 方向沿湖下降，右侧是 Remarkables 山脉，出片率极高。"
  },
  {
    aircraft: "a320",
    from: ["KDEN", "丹佛"],
    to: ["KASE", "阿斯彭"],
    dist: 110,
    time: "0h 55m",
    note: "落基山短途。航程很短但进近难度高，冬季注意跑道污染和山区乱流。"
  },
  {
    aircraft: "a320",
    from: ["VIDP", "德里"],
    to: ["VNKT", "加德满都"],
    dist: 440,
    time: "1h 45m",
    note: "喜马拉雅门户航线。02 方向进近时正前方就是整条喜马拉雅，晴天能看到珠峰。"
  },

  /* ---- B777 ---- */
  {
    aircraft: "b777",
    from: ["ZBAA", "北京首都"],
    to: ["EGLL", "伦敦希思罗"],
    dist: 4400,
    time: "10h 40m",
    note: "国航 777-300ER 的经典欧线。穿越蒙古和西伯利亚，冬季夜里能看到极光。"
  },
  {
    aircraft: "b777",
    from: ["KJFK", "纽约肯尼迪"],
    to: ["OMDB", "迪拜"],
    dist: 5950,
    time: "12h 30m",
    note: "阿联酋的长程线。777 的 GE90 推力富余，起飞后爬升率很可观。"
  },
  {
    aircraft: "b777",
    from: ["VHHH", "香港"],
    to: ["KLAX", "洛杉矶"],
    dist: 6300,
    time: "12h 20m",
    note: "跨太平洋主力航线。777 的襟翼逻辑和空客相反，起飞后收襟翼别搞错顺序。"
  },

  /* ---- B737-800 ---- */
  {
    aircraft: "b738",
    from: ["KSEA", "西雅图"],
    to: ["PAJN", "朱诺"],
    dist: 800,
    time: "2h 20m",
    note: "阿拉斯加航空的招牌线。LDA 08 进近要目视绕山，是本机型最值得练的进近之一。"
  },
  {
    aircraft: "b738",
    from: ["KMIA", "迈阿密"],
    to: ["TNCM", "圣马丁"],
    dist: 1050,
    time: "3h 05m",
    note: "加勒比海经典线。10 方向进近从游客头顶掠过，最后进近段短，减速要早。"
  },
  {
    aircraft: "b738",
    from: ["ZGGG", "广州白云"],
    to: ["VHHH", "香港"],
    dist: 75,
    time: "0h 40m",
    note: "超短途，适合练手。起飞后几乎立刻开始下降，进近 07L 的海景不错。"
  },
  {
    aircraft: "b738",
    from: ["ZSSS", "上海虹桥"],
    to: ["RJTT", "东京羽田"],
    dist: 960,
    time: "2h 45m",
    note: "东亚短途主力线。羽田 34L 进近会掠过东京湾，夜间城市灯光很震撼。"
  }
];

/* ---------- 地景推荐（MSFS 2024） ----------
   外链到 SceneryAddons，不转载任何文件。
   airport 字段用于和机场池匹配，抓取脚本会自动补全。
*/
const SCENERY = [
  {
    airport: "KMIA",
    title: "MK-STUDIOS · KMIA 迈阿密国际",
    author: "MK-STUDIOS",
    version: "v1.0.2",
    size: null,
    url: "https://sceneryaddons.org/mk-studios-kmia-miami-international-airport-msfs-2024/",
    note: "迈阿密是加勒比航线的起点，配合圣马丁短途正好。"
  },
  {
    airport: "LIPZ",
    title: "Atelic · LIPZ 威尼斯马可波罗",
    author: "Atelic",
    version: "v1.0.4",
    size: null,
    url: "https://sceneryaddons.org/atelic-lipz-venice-marco-polo-airport-msfs-2024/",
    note: "进近时能看到泻湖和威尼斯主岛，适合 A320 短途。"
  },
  {
    airport: "KSEZ",
    title: "X-Codr Designs · KSEZ 塞多纳",
    author: "X-Codr Designs",
    version: "v1.0.1",
    size: null,
    url: "https://sceneryaddons.org/x-codr-designs-ksez-sedona-airport-msfs-2024/",
    note: "红岩台地机场，黄昏时最好看，配小飞机飞。"
  },
  {
    airport: "LOWI",
    title: "因斯布鲁克（站内搜索）",
    author: "—",
    version: "—",
    size: null,
    url: "https://sceneryaddons.org/?s=LOWI",
    note: "点开是站内搜索结果，按发布时间挑最新版本。"
  }
];
