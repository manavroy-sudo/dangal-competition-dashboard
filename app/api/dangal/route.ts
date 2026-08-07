import { NextResponse } from "next/server";

const SHEET_ID = "1wiSsEi0NQ5w44Z17H_WvHDA1utYd3K2M_8actBuj9C8";
const GID = "1096580895";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Team A / Team B block starts at the "Team A" header, on the same header
// row as the ZONE table. Column indices below are 0-based, counting from
// the first comma-separated cell in each CSV row.
const COL = {
  teamA: 18,
  aRM: 19,
  aOnbTgt: 20,
  aOnbAch: 21,
  aActTgt: 23,
  aActAch: 24,
  teamB: 27,
  bRM: 28,
  bOnbTgt: 29,
  bOnbAch: 30,
  bActTgt: 32,
  bActAch: 33,
};

const DATA_ROWS = { start: 4, end: 14 }; // 0-indexed rows 4..14 = sheet rows 5..15

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else if (c === "\r") {
        // skip
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function num(v: string | undefined): number | null {
  if (v === undefined) return null;
  const cleaned = v.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned.toUpperCase() === "#N/A") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function pct(ach: number | null, tgt: number | null): number | null {
  if (ach === null || tgt === null || tgt === 0) return null;
  return Math.round((ach / tgt) * 1000) / 10; // one decimal
}

interface Side {
  name: string;
  rm: number | null;
  onbPct: number | null;
  actPct: number | null;
  weighted: number | null;
}

interface Match {
  id: number;
  teamA: Side;
  teamB: Side;
  leader: "A" | "B" | "TIE" | "PENDING";
}

function buildSide(row: string[], base: "A" | "B"): Side {
  const isA = base === "A";
  const name = row[isA ? COL.teamA : COL.teamB]?.trim() || "";
  const rm = num(row[isA ? COL.aRM : COL.bRM]);
  const onbAch = num(row[isA ? COL.aOnbAch : COL.bOnbAch]);
  const onbTgt = num(row[isA ? COL.aOnbTgt : COL.bOnbTgt]);
  const actAch = num(row[isA ? COL.aActAch : COL.bActAch]);
  const actTgt = num(row[isA ? COL.aActTgt : COL.bActTgt]);
  const onbPct = pct(onbAch, onbTgt);
  const actPct = pct(actAch, actTgt);
  const weighted =
    onbPct !== null && actPct !== null
      ? Math.round(((onbPct + actPct) / 2) * 10) / 10
      : null;
  return { name, rm, onbPct, actPct, weighted };
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Sheet fetch failed: ${res.status}` },
        { status: 502 }
      );
    }
    const csv = await res.text();
    const rows = parseCsv(csv);

    const matches: Match[] = [];
    for (let i = DATA_ROWS.start; i <= DATA_ROWS.end; i++) {
      const row = rows[i];
      if (!row) continue;
      const teamA = buildSide(row, "A");
      const teamB = buildSide(row, "B");
      if (!teamA.name || !teamB.name) continue;

      let leader: Match["leader"] = "PENDING";
      if (teamA.weighted !== null && teamB.weighted !== null) {
        if (teamA.weighted > teamB.weighted) leader = "A";
        else if (teamB.weighted > teamA.weighted) leader = "B";
        else leader = "TIE";
      }

      matches.push({ id: matches.length + 1, teamA, teamB, leader });
    }

    return NextResponse.json({
      matches,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
