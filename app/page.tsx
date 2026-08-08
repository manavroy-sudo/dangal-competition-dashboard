"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { LEADERS, leadersForSide, Leader } from "./leaders-data";

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

type Status = "win" | "lose" | "neutral";

const STATUS_COLOR: Record<Status, string> = {
  win: "var(--win)",
  lose: "var(--lose)",
  neutral: "var(--neutral)",
};

function MeterBar({ value, status }: { value: number | null; status: Status }) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value));
  const color = STATUS_COLOR[status];
  return (
    <div className="meter">
      <div
        className={`meter-fill ${status === "win" ? "glow" : ""}`}
        style={{
          width: `${width}%`,
          background: value === null ? "var(--neutral)" : color,
        }}
      />
      <style jsx>{`
        .meter {
          height: 12px;
          border-radius: 999px;
          background: var(--meter-track);
          border: 1px solid var(--card-border);
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
        }
        .meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .meter-fill.glow {
          box-shadow: 0 0 8px 1px var(--win);
        }
      `}</style>
    </div>
  );
}

function CollagePhoto({ leader, i }: { leader: Leader; i: number }) {
  const [failed, setFailed] = useState(false);
  // Deterministic pseudo-scatter: vary size/offset/rotation by index so the
  // arrangement is stable across renders without needing real randomness.
  const size = 58 + ((i * 37) % 40);
  const rise = (i % 2 === 0 ? -1 : 1) * (6 + ((i * 13) % 22));
  const rot = ((i * 17) % 24) - 12;
  if (failed) return null;
  return (
    <div
      className="cphoto"
      style={{
        width: size,
        height: size,
        transform: `translateY(${rise}px) rotate(${rot}deg)`,
        marginLeft: i === 0 ? 0 : -Math.round(size * 0.32),
        zIndex: i % 5,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/leaders/${leader.file}`} alt="" onError={() => setFailed(true)} />
      <style jsx>{`
        .cphoto {
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--gold-deep);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.55);
          flex: none;
        }
        .cphoto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

function DangalCollage() {
  return (
    <div className="collage">
      <div className="collage-track">
        {LEADERS.map((l, i) => (
          <CollagePhoto key={l.file} leader={l} i={i} />
        ))}
      </div>
      <div className="collage-scrim" />
      <style jsx>{`
        .collage {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          overflow: hidden;
          z-index: 0;
        }
        .collage-track {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          row-gap: 10px;
          padding: 10px 40px;
          opacity: 0.85;
        }
        .collage-scrim {
          position: absolute;
          inset: 0;
          background: radial-gradient(70% 90% at 50% 45%, rgba(16, 4, 3, 0.35), rgba(16, 4, 3, 0.82) 75%),
            linear-gradient(180deg, rgba(16, 4, 3, 0.4) 0%, rgba(16, 4, 3, 0.55) 55%, var(--arena-bg-3) 100%);
        }
      `}</style>
    </div>
  );
}

function SideBadge({ sideName, status }: { sideName: string; status: Status }) {
  const color = STATUS_COLOR[status];
  const leaders = leadersForSide(sideName).slice(0, 3);
  if (leaders.length === 0) {
    return (
      <div className="badge">
        <span>{initials(sideName)}</span>
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
            border: 2px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }
  return (
    <div className="stack" title={leaders.map((l) => `${l.name} (${l.state})`).join(", ")}>
      {leaders.map((l, i) => (
        <SidePhoto key={l.file} leader={l} color={color} offset={i} />
      ))}
      <style jsx>{`
        .stack {
          display: flex;
        }
      `}</style>
    </div>
  );
}

function SidePhoto({ leader, color, offset }: { leader: Leader; color: string; offset: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="sp" style={{ marginLeft: offset === 0 ? 0 : -16, zIndex: 3 - offset }}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/leaders/${leader.file}`} alt={leader.name} onError={() => setFailed(true)} />
      ) : (
        <span>{initials(leader.name)}</span>
      )}
      <style jsx>{`
        .sp {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid ${color};
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-2);
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
        }
        .sp img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

function sideStatus(side: "A" | "B", leader: Match["leader"]): Status {
  if (leader === side) return "win";
  if (leader === "TIE" || leader === "PENDING") return "neutral";
  return "lose";
}

function BoutCard({ match }: { match: Match }) {
  const { teamA, teamB, leader } = match;
  const leaderName = leader === "A" ? teamA.name : leader === "B" ? teamB.name : null;
  const statusA = sideStatus("A", leader);
  const statusB = sideStatus("B", leader);

  return (
    <div className={`bout ${leader !== "PENDING" ? "decided" : ""}`}>
      <span className={`flag flag-a ${statusA}`} aria-hidden="true" />
      <span className={`flag flag-b ${statusB}`} aria-hidden="true" />
      <div className="bout-top">
        <span className="bout-no">BOUT {String(match.id).padStart(2, "0")}</span>
        {leaderName ? (
          <span className="result win">🏆 {leaderName}</span>
        ) : leader === "TIE" ? (
          <span className="result tie">🤝 Tie</span>
        ) : (
          <span className="result pending">⏳ Pending</span>
        )}
      </div>

      <div className="face-off">
        <div className={`side ${statusA}`}>
          <SideBadge sideName={teamA.name} status={statusA} />
          <div className="side-name">{teamA.name}</div>
          <div className="side-avg">{fmtPct(teamA.weighted)}</div>
        </div>
        <div className="vs-badge">VS</div>
        <div className={`side ${statusB}`}>
          <SideBadge sideName={teamB.name} status={statusB} />
          <div className="side-name">{teamB.name}</div>
          <div className="side-avg">{fmtPct(teamB.weighted)}</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat-block">
          <div className="stat-label">Onboarding %</div>
          <div className="stat-row">
            <span className={`stat-num ${statusA}`}>{fmtPct(teamA.onbPct)}</span>
            <MeterBar value={teamA.onbPct} status={statusA} />
          </div>
          <div className="stat-row">
            <span className={`stat-num ${statusB}`}>{fmtPct(teamB.onbPct)}</span>
            <MeterBar value={teamB.onbPct} status={statusB} />
          </div>
        </div>

        <div className="stat-block">
          <div className="stat-label">Activation %</div>
          <div className="stat-row">
            <span className={`stat-num ${statusA}`}>{fmtPct(teamA.actPct)}</span>
            <MeterBar value={teamA.actPct} status={statusA} />
          </div>
          <div className="stat-row">
            <span className={`stat-num ${statusB}`}>{fmtPct(teamB.actPct)}</span>
            <MeterBar value={teamB.actPct} status={statusB} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .bout {
          background: var(--card-surface);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 18px 18px 16px;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }
        .bout.decided {
          border-color: rgba(20, 12, 6, 0.16);
        }
        .flag {
          position: absolute;
          top: 0;
          width: 0;
          height: 0;
          border-style: solid;
        }
        .flag-a {
          left: 16px;
          border-width: 0 10px 16px 10px;
        }
        .flag-b {
          right: 16px;
          border-width: 0 10px 16px 10px;
        }
        .flag.win {
          border-color: transparent transparent var(--win) transparent;
        }
        .flag.lose {
          border-color: transparent transparent var(--lose) transparent;
        }
        .flag.neutral {
          border-color: transparent transparent var(--neutral) transparent;
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
          color: var(--card-text-muted);
          font-weight: 600;
        }
        .result {
          font-size: 12.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .result.win {
          color: var(--win);
          background: var(--win-bg);
          border-color: rgba(28, 154, 75, 0.3);
        }
        .result.tie {
          color: var(--card-text-secondary);
          background: var(--neutral-bg);
          border-color: var(--card-border);
        }
        .result.pending {
          color: var(--card-text-muted);
          background: var(--neutral-bg);
          border-color: var(--card-border);
        }
        .face-off {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: start;
          gap: 10px;
          margin-bottom: 16px;
        }
        .side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 0;
          text-align: center;
          padding-top: 6px;
        }
        .side-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--card-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .side.win .side-name {
          color: var(--win);
        }
        .side.lose .side-name {
          color: var(--lose);
        }
        .side-avg {
          font-family: var(--font-display), sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--card-text-primary);
        }
        .side.win .side-avg {
          color: var(--win);
        }
        .side.lose .side-avg {
          color: var(--lose);
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
          margin-top: 60px;
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
          color: var(--card-text-muted);
          margin-bottom: 6px;
        }
        .stat-row {
          display: grid;
          grid-template-columns: 42px 1fr;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .stat-num {
          font-size: 12px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          text-align: right;
          color: var(--card-text-secondary);
        }
        .stat-num.win {
          color: var(--win);
        }
        .stat-num.lose {
          color: var(--lose);
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
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/dangal?_ts=${Date.now()}`, { cache: "no-store" });
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
    } finally {
      setRefreshing(false);
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
        <DangalCollage />
        <div className="ring" aria-hidden="true" />
        <span className="pill">⚔️ STATE VS STATE · LIVE · REFRESHES EVERY 30 MIN</span>
        <h1>
          <span className="wrestlers">🤼</span> DANGAL COMPETITION
        </h1>
        <p className="sub">State vs State · Live Onboarding &amp; Activation Leaderboard · All 11 Bouts</p>
        <p className="meta">
          {lastFetched ? `Last synced ${lastFetched.toLocaleTimeString()}` : "Loading live data…"}
          <button className="refresh-btn" onClick={load} disabled={refreshing}>
            {refreshing ? "Syncing…" : "↻ Refresh now"}
          </button>
        </p>
        {error && <p className="err">Couldn&apos;t refresh: {error}</p>}
      </header>

      <section className="stat-grid">
        <StatTile label="Total Bouts" value={stats.total || 11} />
        <StatTile label="Leading" value={stats.decided} accent="var(--gold)" />
        <StatTile label="Tied" value={stats.tied} accent="var(--text-secondary)" />
        <StatTile label="Pending Data" value={stats.pending} accent="var(--text-muted)" />
      </section>

      <section className="legend">
        <span className="legend-item">
          <i style={{ background: "var(--win)" }} /> Leading state
        </span>
        <span className="legend-item">
          <i style={{ background: "var(--lose)" }} /> Trailing state
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
              <th>Leading</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((m, i) => {
              const statusA = sideStatus("A", m.leader);
              const statusB = sideStatus("B", m.leader);
              return (
                <tr key={m.id}>
                  <td className="rank">{i + 1}</td>
                  <td className={statusA}>{m.teamA.name}</td>
                  <td>{fmtPct(m.teamA.onbPct)}</td>
                  <td>{fmtPct(m.teamA.actPct)}</td>
                  <td className={statusA}>{fmtPct(m.teamA.weighted)}</td>
                  <td className="vs-cell">vs</td>
                  <td className={statusB}>{m.teamB.name}</td>
                  <td>{fmtPct(m.teamB.onbPct)}</td>
                  <td>{fmtPct(m.teamB.actPct)}</td>
                  <td className={statusB}>{fmtPct(m.teamB.weighted)}</td>
                  <td className={m.leader === "A" || m.leader === "B" ? "win" : "neutral"}>
                    {m.leader === "A" ? m.teamA.name : m.leader === "B" ? m.teamB.name : m.leader === "TIE" ? "Tie" : "Pending"}
                  </td>
                </tr>
              );
            })}
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
          padding: 54px 16px 10px;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          border-radius: 24px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .err {
          position: relative;
          color: #ff8a80;
          font-size: 12.5px;
          margin-top: 6px;
        }
        .refresh-btn {
          font-family: var(--font-body), sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--gold);
          background: rgba(240, 196, 25, 0.1);
          border: 1px solid rgba(240, 196, 25, 0.35);
          padding: 3px 10px;
          border-radius: 999px;
          cursor: pointer;
        }
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .refresh-btn:hover:not(:disabled) {
          background: rgba(240, 196, 25, 0.2);
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
          border: 1px solid var(--card-border);
          border-radius: 16px;
          background: var(--card-surface);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }
        .table-title {
          font-family: var(--font-display), sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--gold-deep);
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
          border-bottom: 1px solid var(--card-gridline);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          color: var(--card-text-primary);
        }
        th {
          color: var(--card-text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }
        .rank {
          color: var(--gold-deep);
          font-weight: 700;
        }
        .vs-cell {
          color: var(--card-text-muted);
          text-align: center;
        }
        td.win {
          color: var(--win);
          font-weight: 700;
        }
        td.lose {
          color: var(--lose);
        }
        td.neutral {
          color: var(--card-text-muted);
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
