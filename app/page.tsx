"use client";

import { useEffect, useState, useCallback } from "react";

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

function Bar({
  label,
  value,
  color,
  isWinner,
}: {
  label: string;
  value: number | null;
  color: string;
  isWinner: boolean;
}) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div className="bar-row">
      <div className="bar-label">
        {label}
        {isWinner && value !== null && <span className="crown">✓ leading</span>}
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${width}%`, background: value === null ? "var(--baseline)" : color }}
        />
      </div>
      <div className="bar-value">{fmtPct(value)}</div>
      <style jsx>{`
        .bar-row {
          display: grid;
          grid-template-columns: 130px 1fr 60px;
          align-items: center;
          gap: 10px;
          margin: 6px 0;
        }
        .bar-label {
          font-size: 12.5px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .crown {
          color: var(--good);
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .bar-track {
          height: 10px;
          border-radius: 5px;
          background: var(--gridline);
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.4s ease;
        }
        .bar-value {
          font-size: 12.5px;
          font-variant-numeric: tabular-nums;
          color: var(--text-primary);
          text-align: right;
        }
      `}</style>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const { teamA, teamB, leader } = match;
  const leaderName =
    leader === "A" ? teamA.name : leader === "B" ? teamB.name : null;

  return (
    <div className="card">
      <div className="card-head">
        <span className="match-no">Match {match.id}</span>
        {leaderName ? (
          <span className="chip">🏆 {leaderName} leading</span>
        ) : (
          <span className="chip pending">data pending</span>
        )}
      </div>

      <div className="teams-row">
        <div className={`team-name ${leader === "A" ? "winning" : ""}`}>{teamA.name}</div>
        <span className="vs">vs</span>
        <div className={`team-name ${leader === "B" ? "winning" : ""}`}>{teamB.name}</div>
      </div>

      <Bar label={teamA.name} value={teamA.onbPct} color="var(--series-a)" isWinner={false} />
      <Bar label={teamB.name} value={teamB.onbPct} color="var(--series-b)" isWinner={false} />
      <div className="section-label">Onboarding %</div>

      <Bar label={teamA.name} value={teamA.actPct} color="var(--series-a)" isWinner={false} />
      <Bar label={teamB.name} value={teamB.actPct} color="var(--series-b)" isWinner={false} />
      <div className="section-label">Activation %</div>

      <div className="weighted-row">
        <div className={leader === "A" ? "w-win" : ""}>
          {teamA.name}: <b>{fmtPct(teamA.weighted)}</b>
        </div>
        <div className={leader === "B" ? "w-win" : ""}>
          {teamB.name}: <b>{fmtPct(teamB.weighted)}</b>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .match-no {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .chip {
          font-size: 12px;
          font-weight: 600;
          background: var(--good-bg);
          color: var(--good);
          padding: 3px 10px;
          border-radius: 999px;
        }
        .chip.pending {
          background: var(--gridline);
          color: var(--text-muted);
        }
        .teams-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .team-name {
          font-weight: 600;
          font-size: 14px;
        }
        .team-name.winning {
          color: var(--good);
        }
        .vs {
          color: var(--text-muted);
          font-size: 12px;
        }
        .section-label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 2px 0 12px 0;
        }
        .weighted-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-secondary);
          border-top: 1px solid var(--gridline);
          padding-top: 10px;
          margin-top: 4px;
        }
        .w-win {
          color: var(--good);
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

  return (
    <main className="page">
      <header className="hero">
        <h1>🤼 DANGAL COMPETITION</h1>
        <p className="sub">State vs State — Live Onboarding &amp; Activation Leaderboard · All 11 Matches</p>
        <p className="meta">
          {lastFetched
            ? `Last updated ${lastFetched.toLocaleTimeString()} · auto-refreshes every 30 min`
            : "Loading live data…"}
        </p>
        {error && <p className="err">Couldn&apos;t refresh: {error}</p>}
      </header>

      <section className="legend">
        <span className="legend-item">
          <i style={{ background: "var(--series-a)" }} /> Team A side
        </span>
        <span className="legend-item">
          <i style={{ background: "var(--series-b)" }} /> Team B side
        </span>
        <span className="legend-note">
          Weightage = (Onboarding % + Activation %) / 2 — higher average leads the match
        </span>
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team A</th>
              <th>Onb %</th>
              <th>Act %</th>
              <th>Avg</th>
              <th></th>
              <th>Team B</th>
              <th>Onb %</th>
              <th>Act %</th>
              <th>Avg</th>
              <th>Leading</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
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
                  {m.leader === "A"
                    ? m.teamA.name
                    : m.leader === "B"
                    ? m.teamB.name
                    : m.leader === "TIE"
                    ? "Tie"
                    : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </section>

      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px 60px;
        }
        .hero {
          text-align: center;
          margin-bottom: 24px;
        }
        h1 {
          font-size: clamp(24px, 4vw, 34px);
          margin: 0 0 6px;
          letter-spacing: 0.02em;
        }
        .sub {
          color: var(--text-secondary);
          margin: 0 0 4px;
          font-size: 14px;
        }
        .meta {
          color: var(--text-muted);
          font-size: 12.5px;
          margin: 0;
        }
        .err {
          color: #d03b3b;
          font-size: 12.5px;
          margin-top: 6px;
        }
        .legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          font-size: 12.5px;
          color: var(--text-secondary);
        }
        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
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
          margin-bottom: 32px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface-1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 780px;
        }
        th,
        td {
          text-align: left;
          padding: 10px 12px;
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
        .vs-cell {
          color: var(--text-muted);
          text-align: center;
        }
        .win {
          color: var(--good);
          font-weight: 700;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
      `}</style>
    </main>
  );
}
