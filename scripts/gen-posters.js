const fs = require("fs");
const path = require("path");

const LEADERS_DIR = path.resolve(__dirname, "..", "public", "leaders");
const OUT_DIR = "C:\\Users\\Manav Roy\\Downloads\\Dangal War Room Update";
const HTML_DIR = path.resolve(__dirname, "poster-html");
const API_URL = "https://dangal-competition-dashboard.vercel.app/api/dangal";

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

function photoTag(leader, size) {
  if (!leader) {
    return `<div class="ph placeholder" style="width:${size}px;height:${size}px;">🤼</div>`;
  }
  const p = path.join(LEADERS_DIR, leader.file);
  return `<div class="ph" style="width:${size}px;height:${size}px;"><img src="${fileUrl(p)}" /></div>`;
}

function sideBlock(side, sideName, leaders, isWinner) {
  const lead = leaders[0];
  const extra = leaders.slice(1);
  return `
    <div class="side ${isWinner ? "win" : ""}">
      ${photoTag(lead, 190)}
      ${extra.length ? `<div class="extra">${extra.map((l) => photoTag(l, 56)).join("")}</div>` : ""}
      <div class="state-name">${sideName}</div>
      <div class="leader-names">${leaders.length ? leaders.map((l) => l.name).join(" &amp; ") : "Leader TBD"}</div>
      <div class="pct-row"><span>Onboarding</span><b>${fmtPct(side.onbPct)}</b></div>
      <div class="pct-row"><span>Activation</span><b>${fmtPct(side.actPct)}</b></div>
      <div class="avg">${fmtPct(side.weighted)}<small>AVG SCORE</small></div>
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
    background:
      radial-gradient(900px 700px at 50% 20%, rgba(240,196,25,0.18), transparent 60%),
      radial-gradient(1000px 900px at 50% 60%, #2c0f0a, #100403 75%);
    color: #fbf3e7;
    position: relative;
    overflow: hidden;
  }
  .ring {
    position:absolute; left:50%; top:330px; width:760px; height:760px;
    border-radius:50%; border:3px dashed rgba(212,175,55,0.22); transform:translateX(-50%);
  }
  .ring2 {
    position:absolute; left:50%; top:390px; width:640px; height:640px;
    border-radius:50%; border:2px solid rgba(212,175,55,0.14); transform:translateX(-50%);
  }
  .top { text-align:center; padding-top:56px; position:relative; z-index:2; }
  .pill {
    display:inline-block; font-size:20px; font-weight:700; letter-spacing:0.12em;
    color:#f0c419; background:rgba(240,196,25,0.12); border:2px solid rgba(240,196,25,0.4);
    padding:8px 26px; border-radius:999px; margin-bottom:18px;
  }
  h1 {
    font-size:64px; font-weight:800; letter-spacing:0.02em;
    background: linear-gradient(180deg, #ffe9a8, #d4af37);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    text-shadow: 0 8px 30px rgba(240,196,25,0.3);
  }
  .bout-label { font-size:24px; color:#e2c9ab; letter-spacing:0.16em; margin-top:10px; font-weight:600; }
  .battle {
    display:flex; justify-content:space-between; align-items:flex-start;
    padding: 40px 70px 0; position:relative; z-index:2;
  }
  .side { width: 420px; text-align:center; position:relative; }
  .ph {
    border-radius:50%; overflow:hidden; margin:0 auto 18px;
    border:5px solid #d4af37; box-shadow:0 10px 30px rgba(0,0,0,0.55);
    background: radial-gradient(circle at 35% 30%, #351a14, #100403);
    display:flex; align-items:center; justify-content:center; font-size:70px;
  }
  .ph img { width:100%; height:100%; object-fit:cover; }
  .extra { display:flex; justify-content:center; gap:10px; margin:-8px 0 14px; }
  .extra .ph { margin:0; border-width:3px; }
  .side.win .ph { border-color:#f0c419; box-shadow:0 0 0 6px rgba(240,196,25,0.25), 0 10px 30px rgba(0,0,0,0.6); }
  .state-name { font-size:30px; font-weight:800; line-height:1.15; min-height:76px; }
  .side.win .state-name { color:#f0c419; }
  .leader-names { font-size:17px; color:#c3ab8f; margin:6px 0 18px; min-height:44px; }
  .pct-row {
    display:flex; justify-content:space-between; font-size:19px; color:#e2c9ab;
    border-bottom:1px solid rgba(212,175,55,0.18); padding:8px 6px;
  }
  .pct-row b { color:#fbf3e7; font-variant-numeric: tabular-nums; }
  .avg {
    margin-top:16px; font-size:44px; font-weight:800; color:#fbf3e7;
  }
  .side.win .avg { color:#f0c419; text-shadow:0 0 20px rgba(240,196,25,0.5); }
  .avg small {
    display:block; font-size:13px; letter-spacing:0.14em; color:#a9846a; font-weight:600; margin-top:2px;
  }
  .vs {
    width:120px; height:120px; border-radius:50%; margin-top:70px;
    background: linear-gradient(180deg,#f0c419,#d4af37);
    color:#100403; font-size:34px; font-weight:800;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 0 8px rgba(212,175,55,0.15), 0 10px 30px rgba(0,0,0,0.5);
  }
  .banner {
    position:absolute; bottom:70px; left:0; right:0; text-align:center; z-index:2;
  }
  .banner .win-ribbon {
    display:inline-block; font-size:30px; font-weight:800; color:#100403;
    background: linear-gradient(180deg,#ffe9a8,#d4af37);
    padding:16px 48px; border-radius:999px; box-shadow:0 10px 30px rgba(0,0,0,0.5);
  }
  .banner .pending-ribbon {
    display:inline-block; font-size:24px; font-weight:700; color:#e2c9ab;
    background: rgba(255,255,255,0.06); border:2px solid rgba(212,175,55,0.3);
    padding:14px 40px; border-radius:999px;
  }
  .flag { position:absolute; top:0; width:0; height:0; border-style:solid; }
  .flag-a { left:50px; border-width:0 14px 22px 14px; border-color: transparent transparent #3987e5 transparent; }
  .flag-b { right:50px; border-width:0 14px 22px 14px; border-color: transparent transparent #ef4a44 transparent; }
</style></head>
<body>
  <div class="ring"></div>
  <div class="ring2"></div>
  <div class="top">
    <span class="pill">⚔️ DANGAL COMPETITION</span>
    <div class="bout-label">BOUT ${String(id).padStart(2, "0")} · STATE VS STATE</div>
  </div>
  <div class="battle">
    <span class="flag flag-a"></span>
    <span class="flag flag-b"></span>
    ${sideBlock(teamA, teamA.name, aLeaders, leader === "A")}
    <div class="vs">VS</div>
    ${sideBlock(teamB, teamB.name, bLeaders, leader === "B")}
  </div>
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
