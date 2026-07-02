import React, { useState, useMemo } from 'react'

const MOCK_HISTORY = [
  { date: "Oct 24, 2023", homeTeam: "Manchester City", awayTeam: "Arsenal", target: "Home Win", odds: "1.85", score: "2 - 1", type: "Home", status: "Success", league: "Champions League" },
  { date: "Oct 22, 2023", homeTeam: "Real Madrid", awayTeam: "Barcelona", target: "Draw", odds: "3.40", score: "1 - 1", type: "Draw", status: "Success", league: "La Liga" },
  { date: "Oct 20, 2023", homeTeam: "Bayern Munich", awayTeam: "Dortmund", target: "Home Win", odds: "1.55", score: "1 - 2", type: "Away", status: "Failure", league: "Bundesliga" },
  { date: "Oct 18, 2023", homeTeam: "Liverpool", awayTeam: "Chelsea", target: "Over 2.5 Goals", odds: "1.70", score: "3 - 0", type: "O 2.5", status: "Success", league: "Premier League" },
  { date: "Oct 15, 2023", homeTeam: "AC Milan", awayTeam: "Juventus", target: "Draw", odds: "3.10", score: "0 - 1", type: "Away", status: "Failure", league: "Serie A" },
  { date: "Oct 12, 2023", homeTeam: "Paris SG", awayTeam: "Marseille", target: "Home Win", odds: "1.45", score: "3 - 1", type: "Home", status: "Success", league: "Ligue 1" },
  { date: "Oct 10, 2023", homeTeam: "Atletico Madrid", awayTeam: "Sociedad", target: "Home Win", odds: "1.90", score: "2 - 1", type: "Home", status: "Success", league: "La Liga" },
  { date: "Oct 08, 2023", homeTeam: "Arsenal", awayTeam: "Manchester City", target: "Away Win", odds: "2.15", score: "1 - 0", type: "Home", status: "Failure", league: "Premier League" },
  { date: "Oct 05, 2023", homeTeam: "Newcastle", awayTeam: "Paris SG", target: "Over 2.5 Goals", odds: "1.80", score: "4 - 1", type: "O 2.5", status: "Success", league: "Champions League" },
  { date: "Oct 01, 2023", homeTeam: "Tottenham", awayTeam: "Liverpool", target: "Draw", odds: "3.60", score: "2 - 1", type: "Home", status: "Failure", league: "Premier League" }
]

export default function History() {
  const [search, setSearch] = useState("")
  const [tournamentFilter, setTournamentFilter] = useState("All Tournaments")
  const [timeFilter, setTimeFilter] = useState("All Time")
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const [userPredictions, setUserPredictions] = useState(() => {
    try {
      const saved = localStorage.getItem("user_predictions");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load user predictions:", e);
      return [];
    }
  });

  const combinedHistory = useMemo(() => {
    return [...userPredictions, ...MOCK_HISTORY];
  }, [userPredictions]);

  const totalPredictionsProcessed = useMemo(() => {
    return (12408 + userPredictions.length).toLocaleString();
  }, [userPredictions]);

  // Filter logic
  const filteredData = useMemo(() => {
    return combinedHistory.filter(item => {
      // Search
      const searchMatch = 
        item.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
        item.awayTeam.toLowerCase().includes(search.toLowerCase()) ||
        item.target.toLowerCase().includes(search.toLowerCase());
      
      // Tournament
      let tourneyMatch = true
      if (tournamentFilter !== "All Tournaments") {
        tourneyMatch = item.league === tournamentFilter;
      }

      return searchMatch && tourneyMatch
    })
  }, [combinedHistory, search, tournamentFilter])

  // Dynamic tournament options based on all available leagues
  const tournamentOptions = useMemo(() => {
    const list = new Set(combinedHistory.map(item => item.league));
    return ["All Tournaments", ...Array.from(list)];
  }, [combinedHistory]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * itemsPerPage
    return filteredData.slice(startIdx, startIdx + itemsPerPage)
  }, [filteredData, page])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1

  return (
    <div className="flex flex-col gap-card-gap">
      {/* Global Background Glow/Depth */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-4 relative z-10">
        <h1 className="font-display-lg text-display-lg text-on-surface">Prediction History</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Review the AI model's past performance, accuracy metrics, and detailed match resolutions.
        </p>
      </div>

      {/* Overview Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-card-gap relative z-10">
        {/* Historical Accuracy Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Historical Accuracy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-stat-xl text-[48px] leading-[48px] font-bold text-secondary">
                78.4<span className="text-[32px] text-secondary/70">%</span>
              </span>
            </div>
            <span className="font-body-md text-[13px] text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.1% this month
            </span>
          </div>
          {/* Circular Gauge SVG */}
          <div className="relative w-20 h-20 flex-shrink-0 z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
              <path className="text-secondary drop-shadow-[0_0_8px_rgba(78,222,163,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="78.4, 100" strokeLinecap="round" strokeWidth="3"></path>
            </svg>
          </div>
        </div>

        {/* Predictions Processed Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Predictions Processed
            </span>
            <span className="font-stat-xl text-[48px] leading-[48px] font-bold text-on-surface mt-1">{totalPredictionsProcessed}</span>
            <span className="font-body-md text-[13px] text-on-surface-variant mt-2">Across 14 active leagues</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary z-10">
            <span className="material-symbols-outlined">dataset</span>
          </div>
        </div>

        {/* ROI Card */}
        <div className="bg-surface-container/40 border border-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[40px]"></div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Model Yield (ROI)
            </span>
            <span className="font-stat-xl text-[48px] leading-[48px] font-bold text-secondary mt-1">+14.2%</span>
            <span className="font-body-md text-[13px] text-on-surface-variant mt-2">Based on flat 1u staking</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary z-10">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="bg-surface-container/30 border border-white/5 backdrop-blur-sm rounded-lg p-4 flex flex-col md:flex-row items-center gap-4 justify-between mt-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-auto">
            <select 
              value={tournamentFilter}
              onChange={(e) => { setTournamentFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-surface-container-high border border-white/10 rounded-md py-2 pl-4 pr-10 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer w-full md:w-48"
            >
              {tournamentOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">
              expand_more
            </span>
          </div>

          <div className="relative group w-full md:w-auto">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-surface-container-high border border-white/10 rounded-md py-2 pl-4 pr-10 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer w-full md:w-40"
            >
              <option>All Time</option>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Season</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary">
              calendar_today
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <input 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-white/10 rounded-md py-2 pl-10 pr-4 font-body-md text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-inner" 
            placeholder="Search matches or teams..." 
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
        </div>
      </section>

      {/* History Data Table (Glass Card) */}
      <section className="bg-surface-container/40 border border-white/10 backdrop-blur-xl rounded-xl shadow-lg overflow-x-auto border-t-white/20 relative z-10">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">Date</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">Match Details</th>
              <th class="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">AI Prediction</th>
              <th class="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">Actual Result</th>
              <th class="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular">
            {paginatedData.map((row, idx) => {
              const isSuccess = row.status === 'Success';
              const indicatorBg = 
                row.league === 'Champions League' ? 'bg-primary' :
                row.league === 'Premier League' ? 'bg-tertiary' :
                row.league === 'La Liga' ? 'bg-outline' :
                row.league === 'UEFA European Championship' ? 'bg-secondary' :
                row.league === 'FIFA World Cup' ? 'bg-primary-container' : 'bg-outline-variant';
              
              return (
                <tr key={idx} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors group ${!isSuccess && row.status !== 'Pending' ? 'bg-error/5' : ''}`}>
                  <td className="py-4 px-6 text-on-surface-variant">{row.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-1 h-4 ${indicatorBg} rounded-sm`}></span>
                      <span className="text-on-surface font-semibold">{row.homeTeam}</span>
                      <span className="text-outline text-[12px] mx-1">vs</span>
                      <span className="text-on-surface">{row.awayTeam}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded border border-white/10 text-on-surface">
                      {row.target} <span className="text-primary text-[11px] font-label-caps ml-1">@{row.odds}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface">
                    {row.score} {row.type !== 'Pending' && <span className="text-outline text-[12px] ml-1">({row.type})</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {row.status === 'Success' ? (
                      <div className="inline-flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 text-secondary px-3 py-1 rounded-full font-label-caps text-[11px] uppercase tracking-wide float-right">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Success
                      </div>
                    ) : row.status === 'Failure' ? (
                      <div className="inline-flex items-center gap-1.5 bg-error/10 border border-error/20 text-error px-3 py-1 rounded-full font-label-caps text-[11px] uppercase tracking-wide float-right">
                        <span className="material-symbols-outlined text-[14px]">cancel</span> Failure
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-label-caps text-[11px] uppercase tracking-wide float-right">
                        <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Pending
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                  No records found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Mockup */}
        <div className="py-4 px-6 border-t border-white/10 flex items-center justify-between text-on-surface-variant font-data-tabular text-[13px]">
          <span>
            Showing {filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded border border-white/10 transition-colors ${
                  page === num ? 'bg-primary/20 text-primary border-primary/30' : 'hover:bg-white/5'
                }`}
              >
                {num}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
