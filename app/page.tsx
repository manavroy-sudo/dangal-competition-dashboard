"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

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

interface ApiResponse {
  matches: Match[];
  updatedAt: string;
  error?: string;
}

const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

function fmtPct(v: number | null) {
  return v === null ? "N/A" : `${v.toFixed(1)}%`;
}

function initials(name: string) {
  const words = name.replace(/\+/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function MeterBar({
  value,
  color,
  glow,
}: {
  value: number | null;
  color: string;
  glow: boolean;
}) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div className="meter">
      <div
        className={`meter-fill ${glow ? "glow" : ""}`}
        style={{
          width: `${width}%`,
          background: value === null ? "var(--baseline)" : `linear-gradient(90deg, ${color}aa, ${color})`,
        }}
      />
      <style jsx>{`
        .meter {
          height: 12px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .meter-fill.glow {
          box-shadow: 0 0 10px 1px var(--gold);
        }
      `}</style>
    </div>
  );
}

function CornerBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className="badge">
      <span>{initials(name)}</span>
      <style jsx>{`
        .badge {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          background: radial-gradient(circle at 35% 30%, ${color}, ${color}bb 70%);
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
        }
      `}</style>
    </div>
  );
}

function BoutCard({ match }: { match: Match }) {
  const { teamA, teamB, leader } = match;
  const leaderName = leader === "A" ? teamA.name : leader === "B" ? teamB.name : null;

  return (
    <div className={`bout ${leader !== "PENDING" ? "decided" : ""}`}>
      <div className="bout-top">
        <span className="bout-no">BOUT {String(match.id).padStart(2, "0")}</span>
        {leaderName ? (
          <span className="result">🏆 {leaderName}</span>
        ) : leader === "TIE" ? (
          <span className="result tie">🤝 Tie</span>
        ) : (
          <span className="result pending">⏳ Pending</span>
        )}
      </div>

      <div className="face-off">
        <div className={`side ${leader === "A" ? "win" : ""}`}>
          <CornerBadge name={teamA.name} color="var(--corner-blue)" />
          <div className="side-name">{teamA.name}</div>
          <div className="side-avg">{fmtPct(teamA.weighted)}</div>
        </div>
        <div className="vs-badge">VS</div>
        <div className={`side ${leader === "B" ? "win" : ""}`}>
          <div className="side-name">{teamB.name}</div>
          <div className="side-avg">{fmtPct(teamB.weighted)}</div>
          <CornerBadge name={teamB.name} color="var(--corner-red)" />
        </div>
      </div>

      <div className="stats">
        <div className="stat-block">
          <div className="stat-label">Onboarding %</div>
          <div className="stat-row">
            <span className="stat-num a">{fmtPct(teamA.onbPct)}</span>
            <MeterBar value={teamA.onbPct} color="var(--corner-blue)" glow={leader === "A"} />
          </div>
          <div className="stat-row">
            <MeterBar value={teamB.onbPct} color="var(--corner-red)" glow={leader === "B"} />
            <span className="stat-num b">{fmtPct(teamB.onbPct)}</span>
          </div>
        </div>

        <div className="stat-block">
          <div className="stat-label">Activation %</div>
          <div className="stat-row">
            <span className="stat-num a">{fmtPct(teamA.actPct)}</span>
            <MeterBar value={teamA.actPct} color="var(--corner-blue)" glow={leader === "A"} />
          </div>
          <div className="stat-row">
            <MeterBar value={teamB.actPct} color="var(--corner-red)" glow={leader === "B"} />
            <span className="stat-num b">{fmtPct(teamB.actPct)}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bout {
          background: linear-gradient(180deg, var(--surface-2), var(--surface-1));
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 18px 16px;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
        .bout.decided {
          border-color: rgba(240, 196, 25, 0.35);
        }
        .bout-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .bout-no {
          font-family: var(--font-display), sans-serif;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .result {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--gold);
          background: rgba(240, 196, 25, 0.12);
          border: 1px solid rgba(240, 196, 25, 0.3);
          padding: 3px 10px;
          border-radius: 999px;
        }
        .result.tie {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border);
        }
        .result.pending {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border);
        }
        .face-off {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .side {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .side:last-child {
          flex-direction: row-reverse;
          text-align: right;
        }
        .side-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .side.win .side-name {
          color: var(--gold);
        }
        .side-avg {
          font-family: var(--font-display), sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          min-width: 46px;
        }
        .side.win .side-avg {
          color: var(--gold);
          text-shadow: 0 0 12px rgba(240, 196, 25, 0.5);
        }
        .vs-badge {
          font-family: var(--font-display), sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--arena-bg-3);
          background: var(--rope);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
        }
        .stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stat-label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .stat-row {
          display: grid;
          grid-template-columns: 42px 1fr;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .stat-row:last-child {
          grid-template-columns: 1fr 42px;
        }
        .stat-num {
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
        .stat-row:last-child .stat-num {
          text-align: left;
        }
        .stat-num.a {
          color: var(--corner-blue);
        }
        .stat-num.b {
          color: var(--corner-red);
        }
      `}</style>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="tile">
      <div className="tile-value" style={{ color: accent }}>
        {value}
      </div>
      <div className="tile-label">{label}</div>
      <style jsx>{`
        .tile {
          background: linear-gradient(180deg, var(--surface-2), var(--surface-1));
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px 14px;
          text-align: center;
        }
        .tile-value {
          font-family: var(--font-display), sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .tile-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dangal", { cache: "no-store" });
      const json: ApiResponse = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
        setError(null);
        setLastFetched(new Date());
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  const matches = data?.matches || [];

  const stats = useMemo(() => {
    const decided = matches.filter((m) => m.leader === "A" || m.leader === "B").length;
    const tied = matches.filter((m) => m.leader === "TIE").length;
    const pending = matches.filter((m) => m.leader === "PENDING").length;
    return { decided, tied, pending, total: matches.length };
  }, [matches]);

  const ranked = useMemo(() => {
    return [...matches].sort((a, b) => {
      const aMax = Math.max(a.teamA.weighted ?? -1, a.teamB.weighted ?? -1);
      const bMax = Math.max(b.teamA.weighted ?? -1, b.teamB.weighted ?? -1);
      return bMax - aMax;
    });
  }, [matches]);

  return (
    <main className="page">
      <header className="hero">
        <div className="ring" aria-hidden="true" />
        <span className="pill">🥇 LIVE · REFRESHES EVERY 30 MIN</span>
        <h1>
          <span className="wrestlers">🤼</span> DANGAL COMPETITION
        </h1>
        <p className="sub">State vs State · Live Onboarding &amp; Activation Leaderboard · All 11 Bouts</p>
        <p className="meta">
          {lastFetched ? `Last synced ${lastFetched.toLocaleTimeString()}` : "Loading live data…"}
        </p>
        {error && <p className="err">Couldn&apos;t refresh: {error}</p>}
      </header>

      <section className="stat-grid">
        <StatTile label="Total Bouts" value={stats.total || 11} />
        <StatTile label="Decided" value={stats.decided} accent="var(--gold)" />
        <StatTile label="Tied" value={stats.tied} accent="var(--text-secondary)" />
        <StatTile label="Pending Data" value={stats.pending} accent="var(--text-muted)" />
      </section>

      <section className="legend">
        <span className="legend-item">
          <i style={{ background: "var(--corner-blue)" }} /> Corner A
        </span>
        <span className="legend-item">
          <i style={{ background: "var(--corner-red)" }} /> Corner B
        </span>
        <span className="legend-note">Weightage = (Onboarding % + Activation %) / 2 — higher average wins the bout</span>
      </section>

      <section className="table-wrap">
        <div className="table-title">🏅 Leaderboard — Ranked by Best Side Average</div>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Corner A</th>
              <th>Onb %</th>
              <th>Act %</th>
              <th>Avg</th>
              <th></th>
              <th>Corner B</th>
              <th>Onb %</th>
              <th>Act %</th>
              <th>Avg</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((m, i) => (
              <tr key={m.id}>
                <td className="rank">{i + 1}</td>
                <td className={m.leader === "A" ? "win" : ""}>{m.teamA.name}</td>
                <td>{fmtPct(m.teamA.onbPct)}</td>
                <td>{fmtPct(m.teamA.actPct)}</td>
                <td className={m.leader === "A" ? "win" : ""}>{fmtPct(m.teamA.weighted)}</td>
                <td className="vs-cell">vs</td>
                <td className={m.leader === "B" ? "win" : ""}>{m.teamB.name}</td>
                <td>{fmtPct(m.teamB.onbPct)}</td>
                <td>{fmtPct(m.teamB.actPct)}</td>
                <td className={m.leader === "B" ? "win" : ""}>{fmtPct(m.teamB.weighted)}</td>
                <td className="win">
                  {m.leader === "A" ? m.teamA.name : m.leader === "B" ? m.teamB.name : m.leader === "TIE" ? "Tie" : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid">
        {matches.map((m) => (
          <BoutCard key={m.id} match={m} />
        ))}
      </section>

      <style jsx>{`
        .page {
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 20px 70px;
        }
        .hero {
          text-align: center;
          margin-bottom: 28px;
          position: relative;
          padding: 28px 16px 10px;
        }
        .ring {
          position: absolute;
          inset: -20px 50% auto 50%;
          transform: translateX(-50%);
          width: 620px;
          max-width: 90vw;
          height: 620px;
          border-radius: 50%;
          border: 2px dashed rgba(212, 175, 55, 0.18);
          pointer-events: none;
          z-index: 0;
        }
        .pill {
          position: relative;
          display: inline-block;
          font-family: var(--font-display), sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--gold);
          background: rgba(240, 196, 25, 0.1);
          border: 1px solid rgba(240, 196, 25, 0.35);
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 14px;
        }
        h1 {
          position: relative;
          font-family: var(--font-display), sans-serif;
          font-size: clamp(30px, 6vw, 54px);
          font-weight: 700;
          letter-spacing: 0.03em;
          margin: 0 0 10px;
          background: linear-gradient(180deg, #ffe9a8, var(--gold-deep));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 6px 30px rgba(240, 196, 25, 0.25);
        }
        .wrestlers {
          -webkit-text-fill-color: initial;
        }
        .sub {
          position: relative;
          color: var(--text-secondary);
          margin: 0 0 6px;
          font-size: 14.5px;
        }
        .meta {
          position: relative;
          color: var(--text-muted);
          font-size: 12.5px;
          margin: 0;
        }
        .err {
          position: relative;
          color: #ff8a80;
          font-size: 12.5px;
          margin-top: 6px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .legend-item i {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          display: inline-block;
        }
        .legend-note {
          color: var(--text-muted);
        }
        .table-wrap {
          overflow-x: auto;
          margin-bottom: 36px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: linear-gradient(180deg, var(--surface-2), var(--surface-1));
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
        .table-title {
          font-family: var(--font-display), sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--gold);
          padding: 16px 18px 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 820px;
        }
        th,
        td {
          text-align: left;
          padding: 10px 14px;
          border-bottom: 1px solid var(--gridline);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        th {
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }
        .rank {
          color: var(--gold);
          font-weight: 700;
        }
        .vs-cell {
          color: var(--text-muted);
          text-align: center;
        }
        .win {
          color: var(--gold);
          font-weight: 700;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }
      `}</style>
    </main>
  );
}
