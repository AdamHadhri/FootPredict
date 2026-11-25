import React, { useState, useMemo, useEffect } from 'react'
import countries from "../../countries.json"
import {
  getPredictionHistory,
  deletePrediction,
  clearPredictionHistory,
} from "../utils/predictionHistory"

const DEFAULT_TOURNAMENTS = [
  "UEFA European Championship",
  "FIFA World Cup",
  "UEFA Nations League",
  "International Friendly",
];

function getTeamFlagUrl(teamName) {
  if (!teamName) return "";
  const country = countries.find(
    (c) => c.name.toLowerCase() === teamName.toLowerCase()
  );
  return country ? `https://flagcdn.com/${country.code}.svg` : "";
}

function getTournamentAccent(tournament) {
  switch (tournament) {
    case "FIFA World Cup":
      return "bg-secondary";
    case "UEFA European Championship":
      return "bg-primary";
    case "UEFA Nations League":
      return "bg-primary-container";
    case "International Friendly":
      return "bg-tertiary";
    default:
      return "bg-outline";
  }
}

export default function History({ onNavigate }) {
  const [predictions, setPredictions] = useState(() => getPredictionHistory());
  const [search, setSearch] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("All Tournaments");
  const [outcomeFilter, setOutcomeFilter] = useState("All Outcomes");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [confirmClear, setConfirmClear] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Keep in sync if another tab updates localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "user_predictions") {
        setPredictions(getPredictionHistory());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Overview stats calculated purely from this user's local predictions
  const stats = useMemo(() => {
    const total = predictions.length;
    const tournaments = new Set(predictions.map((p) => p.tournament));

    const validConfidences = predictions
      .map((p) => p.confidence)
      .filter((c) => typeof c === "number" && !Number.isNaN(c));
    const avgConfidence =
      validConfidences.length > 0
        ? Math.round(
            (validConfidences.reduce((sum, val) => sum + val, 0) /
              validConfidences.length) *
              10
          ) / 10
        : 0;

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    for (const p of predictions) {
      if (p.projectedWinner === "home") homeWins++;
      else if (p.projectedWinner === "away") awayWins++;
      else draws++;
    }

    return {
      total,
      tournamentCount: tournaments.size,
      avgConfidence,
      homeWins,
      draws,
      awayWins,
    };
  }, [predictions]);

  // Dynamic tournament filter options
  const tournamentOptions = useMemo(() => {
    const set = new Set([
      ...DEFAULT_TOURNAMENTS,
      ...predictions.map((item) => item.tournament),
    ]);
    return ["All Tournaments", ...Array.from(set)];
  }, [predictions]);

  // Filter logic
  const filteredData = useMemo(() => {
    const now = Date.now();
    const query = search.trim().toLowerCase();

    return predictions.filter((item) => {
      // Search match
      const searchMatch =
        !query ||
        item.homeTeam.toLowerCase().includes(query) ||
        item.awayTeam.toLowerCase().includes(query) ||
        item.tournament.toLowerCase().includes(query) ||
        (item.stadiumCountry &&
          item.stadiumCountry.toLowerCase().includes(query)) ||
        item.projectedOutcome.toLowerCase().includes(query);

      // Tournament filter
      const tourneyMatch =
        tournamentFilter === "All Tournaments" ||
        item.tournament === tournamentFilter;

      // Outcome filter
      const outcomeMatch =
        outcomeFilter === "All Outcomes" ||
        item.projectedOutcome === outcomeFilter;

      // Time filter
      let timeMatch = true;
      if (timeFilter !== "All Time") {
        const itemTime = new Date(item.timestamp).getTime();
        if (!Number.isNaN(itemTime)) {
          const diffMs = now - itemTime;
          const dayMs = 24 * 60 * 60 * 1000;
          if (timeFilter === "Today") {
            const todayStr = new Date().toDateString();
            timeMatch = new Date(itemTime).toDateString() === todayStr;
          } else if (timeFilter === "Last 7 Days") {
            timeMatch = diffMs <= 7 * dayMs;
          } else if (timeFilter === "Last 30 Days") {
            timeMatch = diffMs <= 30 * dayMs;
          }
        }
      }

      return searchMatch && tourneyMatch && outcomeMatch && timeMatch;
    });
  }, [predictions, search, tournamentFilter, outcomeFilter, timeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // Keep page within bounds after deletions or filter changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, page]);

  const handleDelete = (id) => {
    const updated = deletePrediction(id);
    setPredictions(updated);
  };

  const handleClearAll = () => {
    const updated = clearPredictionHistory();
    setPredictions(updated);
    setConfirmClear(false);
    setPage(1);
  };

  const renderTeamChip = (teamName, isWinner) => {
    const flagUrl = getTeamFlagUrl(teamName);
    return (
      <div className="inline-flex items-center gap-2">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`${teamName} flag`}
            className="w-6 h-4 rounded-[3px] object-cover border border-white/15 flex-shrink-0"
          />
        ) : (
          <span className="w-6 h-4 rounded-[3px] bg-surface-container-highest border border-white/15 flex items-center justify-center text-[9px] font-label-caps text-on-surface-variant flex-shrink-0">
            {teamName.substring(0, 2).toUpperCase()}
          </span>
        )}
        <span
          className={
            isWinner
              ? "text-on-surface font-semibold"
              : "text-on-surface-variant"
          }
        >
          {teamName}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-card-gap">
      {/* Global Background Glow/Depth */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/60 border border-white/10 w-fit">
            <span className="material-symbols-outlined text-[14px] text-secondary">
              lock
            </span>
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
              Local Device Storage • Private to You
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">
            Prediction History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Review your saved international match predictions, win probability
            breakdowns, and venue context computed by the XGBoost Ensemble.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate("predict")}
              className="inline-flex items-center gap-2 bg-primary text-on-primary-container font-data-tabular font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-primary-fixed transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(173,198,255,0.2)]"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_chart
              </span>
              New Prediction
            </button>
          )}

          {predictions.length > 0 &&
            (!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-error hover:border-error/30 font-data-tabular text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete_sweep
                </span>
                Clear History
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                <span className="font-data-tabular text-xs text-error">
                  Delete all?
                </span>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded bg-error text-on-error font-label-caps text-[11px] uppercase hover:opacity-90 transition-opacity"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded bg-white/10 text-on-surface font-label-caps text-[11px] uppercase hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Overview Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-card-gap relative z-10">
        {/* Saved Predictions Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Your Predictions
            </span>
            <span className="font-stat-xl text-[48px] leading-[48px] font-bold text-on-surface mt-1">
              {stats.total.toLocaleString()}
            </span>
            <span className="font-body-md text-[13px] text-on-surface-variant mt-2">
              {stats.total === 0
                ? "No matches predicted yet"
                : `Across ${stats.tournamentCount} international ${
                    stats.tournamentCount === 1 ? "tournament" : "tournaments"
                  }`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary z-10">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
        </div>

        {/* Average Model Confidence Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Avg. Top Probability
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-stat-xl text-[48px] leading-[48px] font-bold text-secondary">
                {stats.total > 0 ? stats.avgConfidence.toFixed(1) : "--"}
                {stats.total > 0 && (
                  <span className="text-[28px] text-secondary/70">%</span>
                )}
              </span>
            </div>
            <span className="font-body-md text-[13px] text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                psychology
              </span>
              Mean projected outcome confidence
            </span>
          </div>
          {/* Circular Gauge SVG */}
          <div className="relative w-20 h-20 flex-shrink-0 z-10">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-white/10"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              ></path>
              <path
                className="text-secondary drop-shadow-[0_0_8px_rgba(78,222,163,0.5)] transition-all duration-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${stats.total > 0 ? stats.avgConfidence : 0}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
            </svg>
          </div>
        </div>

        {/* Outcome Split Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-tertiary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-2 relative z-10 w-full">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Projected Outcomes Split
            </span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="bg-surface-dim/70 border border-white/5 rounded-lg px-3 py-2 flex flex-col">
                <span className="font-label-caps text-[10px] text-secondary uppercase">
                  Home
                </span>
                <span className="font-stat-xl text-2xl font-bold text-on-surface">
                  {stats.homeWins}
                </span>
              </div>
              <div className="bg-surface-dim/70 border border-white/5 rounded-lg px-3 py-2 flex flex-col">
                <span className="font-label-caps text-[10px] text-primary uppercase">
                  Draw
                </span>
                <span className="font-stat-xl text-2xl font-bold text-on-surface">
                  {stats.draws}
                </span>
              </div>
              <div className="bg-surface-dim/70 border border-white/5 rounded-lg px-3 py-2 flex flex-col">
                <span className="font-label-caps text-[10px] text-tertiary-container uppercase">
                  Away
                </span>
                <span className="font-stat-xl text-2xl font-bold text-on-surface">
                  {stats.awayWins}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="bg-surface-container/30 border border-white/5 backdrop-blur-sm rounded-lg p-4 flex flex-col lg:flex-row items-center gap-4 justify-between mt-2 relative z-10">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Tournament Filter */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={tournamentFilter}
              onChange={(e) => {
                setTournamentFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-surface-container-high border border-white/10 rounded-md py-2 pl-4 pr-10 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer w-full sm:w-56"
            >
              {tournamentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">
              expand_more
            </span>
          </div>

          {/* Outcome Filter */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-surface-container-high border border-white/10 rounded-md py-2 pl-4 pr-10 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer w-full sm:w-40"
            >
              <option value="All Outcomes">All Outcomes</option>
              <option value="Home Win">Home Win</option>
              <option value="Draw">Draw</option>
              <option value="Away Win">Away Win</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">
              filter_list
            </span>
          </div>

          {/* Time Filter */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-surface-container-high border border-white/10 rounded-md py-2 pl-4 pr-10 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer w-full sm:w-40"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">
              calendar_today
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-background border border-white/10 rounded-md py-2 pl-10 pr-4 font-body-md text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-inner"
            placeholder="Search nation, tournament, host..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
        </div>
      </section>

      {/* History Data Table or Empty State */}
      <section className="bg-surface-container/40 border border-white/10 backdrop-blur-xl rounded-xl shadow-lg overflow-x-auto border-t-white/20 relative z-10">
        {predictions.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">
                history
              </span>
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                No Local Predictions Yet
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                Every international match prediction you run is automatically
                saved here in your browser&apos;s local storage so only you can
                view and manage your history.
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate("predict")}
                className="mt-2 inline-flex items-center gap-2 bg-primary text-on-primary-container font-data-tabular font-bold px-6 py-3 rounded-lg hover:bg-primary-fixed transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(173,198,255,0.2)]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  play_arrow
                </span>
                Launch Predictor Engine
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                    Date
                  </th>
                  <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                    International Matchup
                  </th>
                  <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                    Tournament &amp; Venue
                  </th>
                  <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
                    Win Probabilities (H / D / A)
                  </th>
                  <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold text-right">
                    Projected Outcome
                  </th>
                  <th className="py-4 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="font-data-tabular text-data-tabular">
                {paginatedData.map((row) => {
                  const hasProbs =
                    typeof row.homeWin === "number" &&
                    typeof row.draw === "number" &&
                    typeof row.awayWin === "number";

                  const outcomeBadgeStyle =
                    row.projectedWinner === "home"
                      ? "bg-secondary/10 border-secondary/30 text-secondary"
                      : row.projectedWinner === "away"
                      ? "bg-tertiary-container/15 border-tertiary-container/30 text-tertiary"
                      : "bg-primary/10 border-primary/30 text-primary";

                  const timeStr = row.timestamp
                    ? new Date(row.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-on-surface">{row.date}</span>
                          {timeStr && (
                            <span className="text-[11px] text-outline">
                              {timeStr}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Matchup */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-1 h-5 ${getTournamentAccent(
                              row.tournament
                            )} rounded-sm flex-shrink-0`}
                          ></span>
                          {renderTeamChip(
                            row.homeTeam,
                            row.projectedWinner === "home"
                          )}
                          <span className="text-outline text-[11px] uppercase px-1">
                            vs
                          </span>
                          {renderTeamChip(
                            row.awayTeam,
                            row.projectedWinner === "away"
                          )}
                        </div>
                      </td>

                      {/* Tournament & Venue */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-on-surface text-[13px]">
                            {row.tournament}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                            {row.stadiumCountry && (
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] text-outline">
                                  location_on
                                </span>
                                {row.stadiumCountry}
                              </span>
                            )}
                            {row.neutralVenue && (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-label-caps uppercase text-primary">
                                Neutral
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Probabilities */}
                      <td className="py-4 px-6">
                        {hasProbs ? (
                          <div className="flex flex-col gap-1.5 min-w-[190px]">
                            <div className="flex items-center justify-between text-[12px]">
                              <span className="text-secondary font-semibold">
                                {row.homeWin.toFixed(1)}%
                              </span>
                              <span className="text-primary">
                                {row.draw.toFixed(1)}%
                              </span>
                              <span className="text-tertiary">
                                {row.awayWin.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-surface-bright overflow-hidden flex">
                              <div
                                className="bg-secondary h-full"
                                style={{ width: `${row.homeWin}%` }}
                              ></div>
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${row.draw}%` }}
                              ></div>
                              <div
                                className="bg-tertiary-container h-full"
                                style={{ width: `${row.awayWin}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-outline text-[12px]">
                            Top confidence:{" "}
                            {row.confidence !== null
                              ? `${row.confidence}%`
                              : "--"}
                          </span>
                        )}
                      </td>

                      {/* Projected Outcome */}
                      <td className="py-4 px-6 text-right">
                        <div
                          className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full font-label-caps text-[11px] uppercase tracking-wide ${outcomeBadgeStyle}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {row.projectedWinner === "draw"
                              ? "balance"
                              : "emoji_events"}
                          </span>
                          <span>{row.projectedOutcome}</span>
                          {row.confidence !== null && (
                            <span className="opacity-80 ml-0.5">
                              ({row.confidence.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delete action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(row.id)}
                          title="Delete prediction"
                          aria-label={`Delete ${row.homeTeam} vs ${row.awayTeam}`}
                          className="p-1.5 rounded-md text-outline hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-on-surface-variant"
                    >
                      No saved predictions match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="py-4 px-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-data-tabular text-[13px]">
              <span>
                Showing{" "}
                {filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(page * itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} saved{" "}
                {filteredData.length === 1 ? "prediction" : "predictions"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-3 py-1 rounded border border-white/10 transition-colors ${
                        page === num
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
