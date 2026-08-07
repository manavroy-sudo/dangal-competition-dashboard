const fs = require("fs");
const path = require("path");

const LEADERS_DIR = path.resolve(__dirname, "..", "public", "leaders");
const OUT_DIR = "C:\\Users\\Manav Roy\\Downloads\\Dangal War Room Update\\1-00 PM Update";
const HTML_DIR = path.resolve(__dirname, "poster-html-v2");
const API_URL = "https://dangal-competition-dashboard.vercel.app/api/dangal";
const STATE_PATHS = JSON.parse(fs.readFileSync(path.resolve(__dirname, "state-paths.json"), "utf8"));

const LEADERS = [
  { name: "Alok Mishra", state: "UP1", role: "RGM", file: "alok-mishra.jpg" },
  { name: "Amit Kumar", state: "NCR", role: "SH", file: "amit-kumar.jpeg" },
  { name: "Anil Zutsi", state: "J&K", role: "RGM", file: "anil-zutsi.webp" },
  { name: "Ashish Srivastava", state: "NCR", role: "RGM", file: "ashish-srivastava.jpeg" },
  { name: "Bellamkonda Umamahesh", state: "AP-TS", file: "bellamkonda-umamahesh.jpg" },
  { name: "Bhavesh", state: "Gujarat", role: "RGM", file: "bhavesh.jpeg" },
  { name: "Bimal", state: "Punjab", role: "SH", file: "bimal.jpeg" },
  { name: "Birendra", state: "Bihar", role: "RGM", file: "birendra.jpg" },
  { name: "Chandan", state: "West Bengal", role: "RH", file: "chandan.jpg" },
  { name: "Charles", state: "Gujarat", role: "RH", file: "charles.jpeg" },
  { name: "Dara Singh", state: "Rajasthan", role: "SH", file: "dara-singh.jpeg" },
  { name: "Gagandeep Singh", state: "Punjab", file: "gagandeep-singh.jpeg" },
  { name: "Jitender Kumar", state: "Himachal Pradesh", file: "jitender-kumar.jpg" },
  { name: "Kanniyappan Hari Kumar", state: "AP-TS", file: "kanniyappan-hari-kumar.jpg" },
  { name: "N Nithin Yadav", state: "Karnataka", file: "n-nithin-yadav.jpeg" },
  { name: "Pankaj", state: "Bihar, Jharkhand, Orissa", file: "pankaj.jpg" },
  { name: "Prince", state: "MP/CG", file: "prince.png" },
  { name: "Puneet Kumar", state: "UP1", role: "RH", file: "puneet-kumar.jpg" },
  { name: "Punit Bhati", state: "Rajasthan 2", file: "punit-bhati.jpeg" },
  { name: "Rahul Gupta", state: "UP1", role: "SH", file: "rahul-gupta.jpeg" },
  { name: "Rameez Ahmad Bhat", state: "J&K", file: "rameez-ahmad-bhat.jpg" },
  { name: "Rohan Oza", state: "Mumbai", file: "rohan-oza.jpg" },
  { name: "Sainath", state: "AP-TS (Andhra & Telangana)", file: "sainath.jpeg" },
  { name: "Shailendra Mahulkar", state: "ROM 1 & 2", file: "shailendra-mahulkar.jpg" },
  { name: "Sundeep Bhati", state: "Haryana", file: "sundeep-bhati.jpg" },
  { name: "Uttam Das", state: "Orissa", file: "uttam-das.webp" },
  { name: "Vijjith", state: "Kerala", file: "vijjith.webp" },
  { name: "Vikas Kumar", state: "Rajasthan 1", file: "vikas-kumar.webp" },
  { name: "Vikram Thakur", state: "J&K, HP, Chandigarh", file: "vikram-thakur.jpg" },
  { name: "Vinothbabu Nagarajan", state: "Tamil Nadu", file: "vinothbabu-nagarajan.jpg" },
  { name: "Vishal", state: "Bihar", file: "vishal.jpeg" },
];

const SIDE_KEYWORDS = {
  "UP1 + UK1 + UK2": ["UP1"],
  "Delhi + NCR + Haryana": ["NCR", "Haryana"],
  "West Bengal": ["West Bengal"],
  "J&K": ["J&K"],
  Bihar: ["Bihar"],
  Punjab: ["Punjab"],
  Jharkhand: ["Jharkhand"],
  "Tamil Nadu": ["Tamil Nadu"],
  Gujarat: ["Gujarat"],
  "Rajasthan 1 + 2": ["Rajasthan"],
  Karnataka: ["Karnataka"],
  "ROM 2": ["ROM 1 & 2", "ROM 2"],
  "MP/CG": ["MP/CG", "MP-CG"],
  Telengana: ["Telangana", "AP-TS"],
  Telangana: ["Telangana", "AP-TS"],
  "Himachal Pradesh": ["Himachal", "HP"],
  Pune: [],
  Chandigarh: ["Chandigarh"],
  "Andhra Pradesh": ["AP-TS", "Andhra"],
  "ROM 1": ["ROM 1 & 2", "ROM 1"],
  Orissa: ["Orissa"],
  Mumbai: ["Mumbai"],
  Kerala: ["Kerala"],
};

const SIDE_STATE_SLUGS = {
  "UP1 + UK1 + UK2": ["uttar-pradesh", "uttarakhand"],
  "Delhi + NCR + Haryana": ["delhi", "haryana"],
  "West Bengal": ["west-bengal"],
  "J&K": ["jammu-and-kashmir"],
  Bihar: ["bihar"],
  Punjab: ["punjab"],
  Jharkhand: ["jharkhand"],
  "Tamil Nadu": ["tamil-nadu"],
  Gujarat: ["gujarat"],
  "Rajasthan 1 + 2": ["rajasthan"],
  Karnataka: ["karnataka"],
  "ROM 2": ["maharashtra"],
  "MP/CG": ["madhya-pradesh", "chhattisgarh"],
  Telengana: ["telangana"],
  "Himachal Pradesh": ["himachal-pradesh"],
  Pune: ["maharashtra"],
  Chandigarh: ["chandigarh"],
  "Andhra Pradesh": ["andhra-pradesh"],
  "ROM 1": ["maharashtra"],
  Orissa: ["odisha"],
  Mumbai: ["maharashtra"],
  Kerala: ["kerala"],
};

function leadersForSide(sideName) {
  const keys = SIDE_KEYWORDS[sideName.trim()] || [];
  if (keys.length === 0) return [];
  return LEADERS.filter((l) => keys.some((k) => l.state.toLowerCase().includes(k.toLowerCase())));
}

function fileUrl(p) {
  return "file:///" + p.replace(/\\/g, "/");
}

function fmtPct(v) {
  return v === null || v === undefined ? "N/A" : `${v.toFixed(1)}%`;
}

function photoTag(leader, size, ringColor) {
  if (!leader) {
    return `<div class="ph placeholder" style="width:${size}px;height:${size}px;border-color:${ringColor};">🤼</div>`;
  }
  const p = path.join(LEADERS_DIR, leader.file);
  return `<div class="ph" style="width:${size}px;height:${size}px;border-color:${ringColor};"><img src="${fileUrl(p)}" /></div>`;
}

function stateMapSvg(slug, pct, color) {
  const s = STATE_PATHS[slug];
  if (!s) return "";
  const clipId = "clip-" + slug + "-" + Math.random().toString(36).slice(2, 8);
  const p = Math.max(0, Math.min(100, pct === null ? 0 : pct));
  const fillY = s.height * (1 - p / 100);
  const fillH = s.height * (p / 100);
  return `
  <svg viewBox="${s.viewBox}" width="100%" height="100%">
    <defs>
      <clipPath id="${clipId}"><path d="${s.d}" /></clipPath>
      <linearGradient id="grad-${clipId}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#${clipId})">
      <rect x="0" y="0" width="${s.height}" height="${s.height}" fill="#ffffff" opacity="0.06"/>
      <rect x="0" y="${fillY.toFixed(2)}" width="${s.height}" height="${fillH.toFixed(2)}" fill="url(#grad-${clipId})"/>
    </g>
    <path d="${s.d}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2.5"/>
  </svg>`;
}

function mapsBlock(sideName, pct, color) {
  const slugs = SIDE_STATE_SLUGS[sideName.trim()] || [];
  if (slugs.length === 0) {
    return `<div class="maps"><div class="map-box single"><span class="no-map">🗺️ MAP N/A</span></div></div>`;
  }
  const boxClass = slugs.length > 1 ? "map-box multi" : "map-box single";
  return `<div class="maps">${slugs.map((slug) => `<div class="${boxClass}">${stateMapSvg(slug, pct, color)}</div>`).join("")}</div>`;
}

function sideBlock(side, sideName, leaders, isWinner, corner) {
  const color = corner === "a" ? "#3987e5" : "#ef4a44";
  const lead = leaders[0];
  const extra = leaders.slice(1);
  const pctVal = side.weighted;

  return `
    <div class="side side-${corner} ${isWinner ? "win" : ""}">
      <div class="photo-wrap">
        ${photoTag(lead, 230, color)}
        ${extra.length ? `<div class="extra">${extra.map((l) => photoTag(l, 54, color)).join("")}</div>` : ""}
      </div>
      <div class="state-name">${sideName}</div>
      <div class="leader-names">${leaders.length ? leaders.map((l) => l.name).join(" &amp; ") : "Leader TBD"}</div>

      ${mapsBlock(sideName, pctVal, color)}
      <div class="map-pct" style="color:${color};">${fmtPct(pctVal)} <small>COVERAGE</small></div>

      <div class="pct-row"><span>Onboarding</span><b>${fmtPct(side.onbPct)}</b></div>
      <div class="pct-row"><span>Activation</span><b>${fmtPct(side.actPct)}</b></div>
      <div class="avg" style="color:${isWinner ? "#f0c419" : "#fbf3e7"};">${fmtPct(side.weighted)}<small>AVG SCORE</small></div>
    </div>
  `;
}

function posterHtml(match) {
  const { id, teamA, teamB, leader } = match;
  const aLeaders = leadersForSide(teamA.name);
  const bLeaders = leadersForSide(teamB.name);
  const winnerName = leader === "A" ? teamA.name : leader === "B" ? teamB.name : null;

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin:0; padding:0; }
  body {
    width: 1080px; height: 1350px;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #fbf3e7;
    position: relative;
    overflow: hidden;
    background: #100403;
  }
  .split-blue {
    position:absolute; inset:0;
    background: linear-gradient(135deg, #0b2a55 0%, #123f7a 45%, #0a1830 100%);
    clip-path: polygon(0 0, 62% 0, 38% 100%, 0 100%);
  }
  .split-red {
    position:absolute; inset:0;
    background: linear-gradient(225deg, #5a0f0f 0%, #7a1414 45%, #300808 100%);
    clip-path: polygon(62% 0, 100% 0, 100% 100%, 38% 100%);
  }
  .seam {
    position:absolute; inset:0;
    background: linear-gradient(135deg, transparent 48%, rgba(240,196,25,0.9) 49.5%, #fff 50%, rgba(240,196,25,0.9) 50.5%, transparent 52%);
    clip-path: polygon(58% 0, 66% 0, 42% 100%, 34% 100%);
    filter: drop-shadow(0 0 18px rgba(240,196,25,0.6));
  }
  .rays {
    position:absolute; inset:0; opacity:0.18;
    background: repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 6deg, rgba(255,255,255,0.5) 6.3deg 6.6deg);
  }
  .top { position:relative; z-index:3; text-align:center; padding-top:50px; }
  .pill {
    display:inline-block; font-size:20px; font-weight:800; letter-spacing:0.12em;
    color:#100403; background: linear-gradient(180deg,#ffe9a8,#d4af37);
    padding:9px 28px; border-radius:999px; box-shadow:0 8px 20px rgba(0,0,0,0.5);
  }
  .bout-label { font-size:22px; color:#fbf3e7; letter-spacing:0.16em; margin-top:12px; font-weight:700; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }

  .arena { position:relative; z-index:2; display:flex; padding-top:30px; height:1060px; }
  .side { width:540px; text-align:center; padding: 10px 34px 0; position:relative; }
  .side-a { padding-right:56px; }
  .side-b { padding-left:56px; }

  .photo-wrap { position:relative; height:280px; display:flex; align-items:flex-start; justify-content:center; }
  .side-a .photo-wrap { transform: rotate(-3deg); }
  .side-b .photo-wrap { transform: rotate(3deg); }
  .ph {
    border-radius:18px; overflow:hidden; border-width:6px; border-style:solid;
    box-shadow:0 16px 34px rgba(0,0,0,0.6);
    background: rgba(0,0,0,0.4);
    display:flex; align-items:center; justify-content:center; font-size:80px;
  }
  .ph img { width:100%; height:100%; object-fit:cover; }
  .win .ph { box-shadow: 0 0 0 7px rgba(240,196,25,0.4), 0 16px 34px rgba(0,0,0,0.65); border-color:#f0c419 !important; }
  .extra { position:absolute; bottom:-10px; right:20px; display:flex; gap:8px; }
  .side-a .extra { right:auto; left:20px; }
  .extra .ph { border-radius:50%; border-width:3px; }

  .state-name { font-size:32px; font-weight:800; margin-top:14px; min-height:78px; line-height:1.15; }
  .win .state-name { color:#f0c419; }
  .leader-names { font-size:15px; color:#dcd0c2; opacity:0.85; margin:2px 0 16px; min-height:38px; }

  .maps { display:flex; justify-content:center; gap:10px; height:150px; }
  .map-box { background: rgba(0,0,0,0.25); border-radius:14px; padding:8px; border:1px solid rgba(255,255,255,0.12); }
  .map-box.single { width:150px; height:150px; }
  .map-box.multi { width:110px; height:150px; }
  .map-pct { font-size:15px; font-weight:700; letter-spacing:0.04em; margin:8px 0 14px; }
  .map-pct small { font-weight:600; opacity:0.7; letter-spacing:0.1em; margin-left:4px; }

  .pct-row {
    display:flex; justify-content:space-between; font-size:17px; color:#e2c9ab;
    border-bottom:1px solid rgba(255,255,255,0.14); padding:7px 4px;
  }
  .pct-row b { color:#fbf3e7; font-variant-numeric: tabular-nums; }
  .avg { margin-top:14px; font-size:40px; font-weight:800; }
  .avg small { display:block; font-size:12px; letter-spacing:0.14em; color:#c9bba5; font-weight:600; margin-top:2px; }

  .vs-medal {
    position:absolute; left:50%; top:520px; transform:translate(-50%,-50%);
    width:130px; height:130px; border-radius:50%; z-index:4;
    background: linear-gradient(180deg,#f0c419,#d4af37);
    color:#100403; font-size:38px; font-weight:900;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 0 0 10px rgba(16,4,3,0.5), 0 14px 34px rgba(0,0,0,0.6);
  }

  .banner { position:absolute; bottom:56px; left:0; right:0; text-align:center; z-index:3; }
  .win-ribbon {
    display:inline-block; font-size:30px; font-weight:800; color:#100403;
    background: linear-gradient(180deg,#ffe9a8,#d4af37);
    padding:16px 50px; border-radius:999px; box-shadow:0 12px 30px rgba(0,0,0,0.55);
  }
  .pending-ribbon {
    display:inline-block; font-size:23px; font-weight:700; color:#fbf3e7;
    background: rgba(0,0,0,0.4); border:2px solid rgba(255,255,255,0.25);
    padding:14px 42px; border-radius:999px;
  }
</style></head>
<body>
  <div class="split-blue"></div>
  <div class="split-red"></div>
  <div class="rays"></div>
  <div class="seam"></div>

  <div class="top">
    <span class="pill">⚔️ DANGAL COMPETITION</span>
    <div class="bout-label">BOUT ${String(id).padStart(2, "0")} &nbsp;·&nbsp; STATE VS STATE</div>
  </div>

  <div class="arena">
    ${sideBlock(teamA, teamA.name, aLeaders, leader === "A", "a")}
    ${sideBlock(teamB, teamB.name, bLeaders, leader === "B", "b")}
  </div>

  <div class="vs-medal">VS</div>

  <div class="banner">
    ${
      winnerName
        ? `<span class="win-ribbon">🏆 ${winnerName} LEADS</span>`
        : leader === "TIE"
        ? `<span class="pending-ribbon">🤝 CURRENTLY TIED</span>`
        : `<span class="pending-ribbon">⏳ DATA PENDING</span>`
    }
  </div>
</body></html>`;
}

async function main() {
  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const res = await fetch(API_URL, { cache: "no-store" });
  const data = await res.json();

  for (const match of data.matches) {
    const html = posterHtml(match);
    const htmlPath = path.join(HTML_DIR, `bout-${String(match.id).padStart(2, "0")}.html`);
    fs.writeFileSync(htmlPath, html, "utf8");
  }

  console.log(`Wrote ${data.matches.length} poster HTML files to ${HTML_DIR}`);
  console.log(`Updated at: ${data.updatedAt}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
