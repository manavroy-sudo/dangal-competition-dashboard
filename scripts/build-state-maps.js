const fs = require("fs");
const path = require("path");

const OUT_FILE = path.resolve(__dirname, "state-paths.json");
const RAW_BASE = "https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/";

const NEEDED = [
  "uttar-pradesh",
  "uttarakhand",
  "delhi",
  "haryana",
  "west-bengal",
  "jammu-and-kashmir",
  "bihar",
  "punjab",
  "jharkhand",
  "tamil-nadu",
  "gujarat",
  "rajasthan",
  "karnataka",
  "maharashtra",
  "madhya-pradesh",
  "chhattisgarh",
  "telangana",
  "himachal-pradesh",
  "chandigarh",
  "andhra-pradesh",
  "odisha",
  "kerala",
];

function allRings(geometry) {
  const rings = [];
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) rings.push(ring);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) {
      for (const ring of poly) rings.push(ring);
    }
  }
  return rings;
}

function buildPath(feature, size = 220, padding = 10) {
  const geometry = feature.geometry;
  const rings = allRings(geometry);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      const x = lon;
      const y = -lat;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const usable = size - padding * 2;
  const scale = Math.min(usable / spanX, usable / spanY);
  const outW = spanX * scale;
  const outH = spanY * scale;
  const offX = padding + (usable - outW) / 2;
  const offY = padding + (usable - outH) / 2;

  const project = (lon, lat) => {
    const x = (lon - minX) * scale + offX;
    const y = (-lat - minY) * scale + offY;
    return [x, y];
  };

  let d = "";
  for (const ring of rings) {
    ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
    });
    d += "Z ";
  }

  return { d: d.trim(), viewBox: `0 0 ${size} ${size}`, height: size };
}

async function main() {
  const result = {};
  for (const slug of NEEDED) {
    const url = RAW_BASE + slug + ".geojson";
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`FAILED ${slug}: ${res.status}`);
      continue;
    }
    const geo = await res.json();
    const feature = geo.type === "FeatureCollection" ? geo.features[0] : geo;
    result[slug] = buildPath(feature);
    console.log(`ok: ${slug}`);
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), "utf8");
  console.log(`Wrote ${Object.keys(result).length} state paths to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
