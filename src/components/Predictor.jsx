import React, { useState } from 'react'
import countries from "../../countries.json"

// Custom CSS-based flag gradients for premium placeholder rendering
const TEAM_COLORS = {
  England: "linear-gradient(135deg, #ffffff 0%, #ffffff 45%, #e00000 45%, #e00000 55%, #ffffff 55%)",
  Spain: "linear-gradient(to bottom, #c60b1e 0%, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%)",
  Brazil: "radial-gradient(circle, #002776 0%, #002776 30%, #ffdf00 31%, #ffdf00 60%, #009c3b 61%)",
  Italy: "linear-gradient(to right, #009246 33%, #f1f2f1 33%, #f1f2f1 66%, #ce2b37 66%)",
  Portugal: "linear-gradient(to right, #006600 40%, #ff0000 40%)",
  Argentina: "linear-gradient(to bottom, #75aadb 33%, #ffffff 33%, #ffffff 66%, #75aadb 66%)"
}

export default function Predictor() {
  const [homeTeam, setHomeTeam] = useState("France")
  const [awayTeam, setAwayTeam] = useState("Germany")
  const [stadiumCountry, setStadiumCountry] = useState("")
  const [tournament, setTournament] = useState("UEFA European Championship")
  const [neutralVenue, setNeutralVenue] = useState(false)
  const [isComputing, setIsComputing] = useState(false)
  const [hasPredicted, setHasPredicted] = useState(false)
  const [apiError, setApiError] = useState(null)

  const [homeWin, setHomeWin] = useState(0)
  const [draw, setDraw] = useState(0)
  const [awayWin, setAwayWin] = useState(0)

  const handleCompute = () => {
    if (homeTeam === "Select Team..." || awayTeam === "Select Team...") return;
    if (homeTeam === awayTeam) return;
    if (!stadiumCountry || stadiumCountry === "Select Stadium Country...") return;

    setIsComputing(true)
    setApiError(null)

    const fetchApi = async () => {
      try {
        const response = await fetch("https://web-production-cd067.up.railway.app/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            home_team: homeTeam,
            away_team: awayTeam,
            tournament: tournament,
            country: stadiumCountry,
            neutral: neutralVenue,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)

        // Support both decimal [0, 1] and percentage [0, 100] fields
        let h = data.home_win ?? data.home_win_probability ?? 0;
        let d = data.draw ?? data.draw_probability ?? 0;
        let a = data.away_win ?? data.away_win_probability ?? 0;

        // If values are in decimal form (0–1), convert to percentage
        if (h <= 1 && d <= 1 && a <= 1 && (h > 0 || d > 0 || a > 0)) {
          h = h * 100;
          d = d * 100;
          a = a * 100;
        }

        // Clean floating-point precision issues
        h = Math.round(h * 100) / 100;
        d = Math.round(d * 100) / 100;
        a = Math.round(a * 100) / 100;

        // OR if you want whole percentages only, use this instead:
        // h = Math.round(h);
        // d = Math.round(d);
        // a = Math.round(a);

        setHomeWin(h);
        setDraw(d);
        setAwayWin(a);
        setHasPredicted(true);
        setIsComputing(false);

        // Save prediction to history
        let localWinner = "Draw";
        if (h > d && h > a) {
          localWinner = "home";
        } else if (a > d && a > h) {
          localWinner = "away";
        }

        const newPrediction = {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          target: localWinner === 'home' ? 'Home Win' : (localWinner === 'away' ? 'Away Win' : 'Draw'),
          odds: `${Math.max(h, a, d).toFixed(0)}%`,
          score: "--",
          type: "Pending",
          status: "Pending",
          league: tournament
        };

        try {
          const existing = localStorage.getItem("user_predictions");
          const list = existing ? JSON.parse(existing) : [];
          localStorage.setItem("user_predictions", JSON.stringify([newPrediction, ...list]));
        } catch (storageError) {
          console.error("Error saving prediction to localStorage:", storageError);
        }
      } catch (error) {
        console.error("Error fetching prediction from API:", error);
        setApiError("Failed to fetch predictions from API. Ensure prediction engine is running.");
        setHomeWin(0);
        setDraw(0);
        setAwayWin(0);
        setHasPredicted(false);
        setIsComputing(false);
      }
    };

    fetchApi();
  }

  const renderTeamEmblem = (teamName, isPulse) => {
    const country = countries.find(c => c.name.toLowerCase() === teamName.toLowerCase());
    const logoUrl = country ? `https://flagcdn.com/${country.code}.svg` : '';
    const customStyle = TEAM_COLORS[teamName]

    let borderStyles = "w-36 h-24 rounded-xl border-2 bg-surface-variant flex items-center justify-center mb-4 overflow-hidden shadow-lg"
    if (isPulse) {
      borderStyles += " border-secondary shadow-[0_0_20px_rgba(78,222,163,0.5)] pulse-dot"
    } else {
      borderStyles += " border-outline-variant/30"
    }

    if (logoUrl) {
      return (
        <div className={borderStyles}>
          <img src={logoUrl} alt={`${teamName} Emblem`} className="w-full h-full object-cover" />
        </div>
      )
    }

    return (
      <div className={borderStyles}>
        {customStyle ? (
          <div className="w-full h-full flex items-center justify-center relative" style={{ background: customStyle }}>
            <span className="font-label-caps text-label-caps bg-black/60 text-white px-2 py-1 rounded text-[10px] uppercase font-bold">
              {teamName.substring(0, 3)}
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
            <span className="font-display-lg text-headline-lg text-on-surface-variant">
              {teamName === "Select Team..." ? "?" : teamName.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Determine Projected Winner
  let projectedWinner = "None"
  let projectedWinnerLabel = "Predictions Pending"
  if (hasPredicted) {
    if (homeWin > draw && homeWin > awayWin) {
      projectedWinner = "home"
      projectedWinnerLabel = `Projected: Home Win`
    } else if (awayWin > draw && awayWin > homeWin) {
      projectedWinner = "away"
      projectedWinnerLabel = `Projected: Away Win`
    } else {
      projectedWinner = "Draw"
      projectedWinnerLabel = "Projected: Draw"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Intent Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Machine Learning Match Outcome Prediction
        </h1>
        <p className="text-on-surface-variant">
          High-velocity predictive models processing historical performance, live telemetry, and team form to compute match probabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap items-start">
        {/* Left Column (Inputs & Status) */}
        <aside className="xl:col-span-4 flex flex-col gap-4 w-full">
          {/* Model Status Panel */}
          <div className="bg-surface-container-high rounded-xl glass-panel p-6 border border-white/5 shadow-lg">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              System Status
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <span className="material-symbols-outlined">memory</span>
              </div>
              <div>
                <p className="font-body-md text-on-surface font-medium mb-1">XGBoost Ensemble v1.0</p>
                <p className="font-data-tabular text-xs text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  Prediction pipeline loaded successfully
                </p>
              </div>
            </div>
          </div>

          {/* Input Form Panel */}
          <div className="bg-surface-container rounded-xl glass-panel p-6 border border-white/5 shadow-lg flex-grow">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-6">New Computation</h3>
            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              {/* Tournament Select */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Tournament Environment</label>
                <div className="relative">
                  <select
                    value={tournament}
                    onChange={(e) => {
                      setTournament(e.target.value);
                      setHasPredicted(false);
                      setApiError(null);
                    }}
                    className="w-full bg-surface-dim border border-outline-variant text-on-surface font-data-tabular rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-inner"
                  >
                    <option>UEFA European Championship</option>
                    <option>FIFA World Cup</option>
                    <option>UEFA Nations League</option>
                    <option>International Friendly</option>
                  </select>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Home Team (Entity A)</label>
                <div className="relative">
                  <select
                    value={homeTeam}
                    onChange={(e) => {
                      setHomeTeam(e.target.value);
                      setHasPredicted(false);
                      setApiError(null);
                    }}
                    className="w-full bg-surface-dim border border-outline-variant text-on-surface font-data-tabular rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-inner"
                  >
                    <option value="Select Team...">Select Team...</option>
                    {countries.map((item, index) => {
                      const capitalized = item.name.charAt(0).toUpperCase() + item.name.slice(1);
                      return (
                        <option key={index} value={capitalized}>
                          {capitalized}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Away Team (Entity B)</label>
                <div className="relative">
                  <select
                    value={awayTeam}
                    onChange={(e) => {
                      setAwayTeam(e.target.value);
                      setHasPredicted(false);
                      setApiError(null);
                    }}
                    className="w-full bg-surface-dim border border-outline-variant text-on-surface font-data-tabular rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-inner"
                  >
                    <option value="Select Team...">Select Team...</option>
                    {countries.map((item, index) => {
                      const capitalized = item.name.charAt(0).toUpperCase() + item.name.slice(1);
                      return (
                        <option key={index} value={capitalized}>
                          {capitalized}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant">Stadium Country</label>
                <div className="relative">
                  <select
                    value={stadiumCountry}
                    onChange={(e) => {
                      setStadiumCountry(e.target.value);
                      setHasPredicted(false);
                      setApiError(null);
                    }}
                    className="w-full bg-surface-dim border border-outline-variant text-on-surface font-data-tabular rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-inner"
                  >
                    <option value="Select Stadium Country...">Select Stadium Country...</option>
                    {countries.map((item, index) => {
                      const capitalized = item.name.charAt(0).toUpperCase() + item.name.slice(1);
                      return (
                        <option key={index} value={capitalized}>
                          {capitalized}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between mt-2 p-3 bg-surface-dim rounded-lg border border-outline-variant/50">
                <div className="flex flex-col">
                  <span className="font-data-tabular text-sm text-on-surface">Neutral Venue</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant">Removes home advantage weights</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={neutralVenue}
                    onChange={(e) => {
                      setNeutralVenue(e.target.checked);
                      setHasPredicted(false);
                      setApiError(null);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Submit */}
              <button
                onClick={handleCompute}
                disabled={isComputing || homeTeam === "Select Team..." || awayTeam === "Select Team..." || homeTeam === awayTeam || !stadiumCountry || stadiumCountry === "Select Stadium Country..."}
                className="mt-4 bg-primary text-on-primary-container font-data-tabular font-bold py-4 px-6 rounded-lg hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(173,198,255,0.2)] flex justify-center items-center gap-2 group"
                type="button"
              >
                <span className={`material-symbols-outlined ${isComputing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}>
                  sync
                </span>
                {isComputing ? 'Computing Predictions...' : 'Execute Prediction'}
              </button>
            </form>
          </div>
        </aside>

        {/* Centerpiece Card: Prediction (Right Column) */}
        <section className="xl:col-span-8 flex flex-col items-center  gap-6 w-full h-full">
          <div className="bg-surface-container-low rounded-xl glass-panel p-container-padding glow-secondary relative overflow-hidden w-full h-full">
            {/* Ambient background glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Card Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary pulse-dot shadow-[0_0_8px_rgba(78,222,163,0.8)]"></div>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Live Model Analysis
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-variant/50 px-3 py-1.5 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                <span className="font-data-tabular text-xs text-on-surface">High Confidence</span>
              </div>
            </div>

            {/* Teams Matchup */}
            <div className="flex items-center justify-between gap-4 mb-12 relative z-10">
              {/* Home Team */}
              <div className={`flex flex-col items-center flex-1 transition-opacity duration-300 ${hasPredicted && projectedWinner === 'away' ? 'opacity-50' : 'opacity-100'}`}>
                {renderTeamEmblem(homeTeam, hasPredicted && projectedWinner === 'home')}
                <div className={`font-label-caps text-[10px] bg-secondary/10 px-2 py-0.5 rounded mb-1 uppercase tracking-widest text-secondary ${hasPredicted && projectedWinner === 'home' ? 'visible' : 'invisible'}`}>
                  Projected Winner
                </div>
                <h2 className="font-stat-xl text-stat-xl text-on-surface text-center mb-1 text-3xl font-bold">
                  {homeTeam === "Select Team..." ? "Team A" : homeTeam}
                </h2>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Home</span>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="bg-surface-bright/50 border border-outline-variant/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <span className="font-stat-xl text-stat-xl text-on-surface-variant opacity-50 italic">VS</span>
                </div>
              </div>

              {/* Away Team */}
              <div className={`flex flex-col items-center flex-1 transition-opacity duration-300 ${hasPredicted && projectedWinner === 'home' ? 'opacity-50' : 'opacity-100'}`}>
                {renderTeamEmblem(awayTeam, hasPredicted && projectedWinner === 'away')}
                <div className={`font-label-caps text-[10px] bg-secondary/10 px-2 py-0.5 rounded mb-1 uppercase tracking-widest text-secondary ${hasPredicted && projectedWinner === 'away' ? 'visible' : 'invisible'}`}>
                  Projected Winner
                </div>
                <h2 className="font-stat-xl text-stat-xl text-on-surface text-center mb-1 text-3xl font-bold">
                  {awayTeam === "Select Team..." ? "Team B" : awayTeam}
                </h2>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Away</span>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="bg-surface-container/50 rounded-lg p-6 border border-white/5 relative z-10">
              <h3 className="font-body-md text-on-surface mb-6 flex justify-between items-end border-b border-white/5 pb-2">
                <span>Computed Outcome Probabilities</span>
              </h3>

              <div className="flex flex-col gap-5">
                {/* Home Win */}
                <div className={`transition-opacity duration-300 ${hasPredicted && projectedWinner === 'away' ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-data-tabular text-data-tabular text-on-surface">
                      {homeTeam === "Select Team..." ? "Home" : homeTeam.toUpperCase()} (Home Win)
                    </span>
                    <span className="font-stat-xl text-xl text-secondary text-stat-xl font-bold">
                      {!hasPredicted || isComputing ? "--" : `${homeWin}%`}
                    </span>
                  </div>
                  <div className="w-full bg-surface-bright h-3 rounded-full overflow-hidden border border-outline-variant/20 shadow-inner">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(78,222,163,0.8)]"
                      style={{ width: !hasPredicted || isComputing ? '0%' : `${homeWin}%` }}
                    ></div>
                  </div>
                </div>

                {/* Draw */}
                <div className={`transition-opacity duration-300 ${hasPredicted && projectedWinner === 'Draw' ? 'opacity-100' : 'opacity-80'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-data-tabular text-data-tabular text-on-surface">Draw</span>
                    <span className="font-stat-xl text-xl text-primary font-bold">
                      {!hasPredicted || isComputing ? "--" : `${draw}%`}
                    </span>
                  </div>
                  <div className="w-full bg-surface-bright h-3 rounded-full overflow-hidden border border-outline-variant/20 shadow-inner">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: !hasPredicted || isComputing ? '0%' : `${draw}%` }}
                    ></div>
                  </div>
                </div>

                {/* Away Win */}
                <div className={`transition-opacity duration-300 ${hasPredicted && projectedWinner === 'home' ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-data-tabular text-data-tabular text-on-surface">
                      {awayTeam === "Select Team..." ? "Away" : awayTeam.toUpperCase()} (Away Win)
                    </span>
                    <span className="font-stat-xl text-xl text-tertiary-container font-bold">
                      {!hasPredicted || isComputing ? "--" : `${awayWin}%`}
                    </span>
                  </div>
                  <div className="w-full bg-surface-bright h-3 rounded-full overflow-hidden border border-outline-variant/20 shadow-inner">
                    <div
                      className="bg-tertiary-container h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: !hasPredicted || isComputing ? '0%' : `${awayWin}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Projected Outcome Highlight */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                <div className={`border rounded-full px-6 py-3 flex items-center gap-3 shadow-lg transition-all duration-300 ${isComputing
                  ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(173,198,255,0.15)]"
                  : (apiError
                    ? "bg-error/10 border-error/40 text-error shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    : (!hasPredicted
                      ? "bg-outline-variant/10 border-outline-variant/40 text-on-surface-variant shadow-none"
                      : "bg-secondary/10 border-secondary/40 text-secondary shadow-[0_0_20px_rgba(78,222,163,0.15)]"))
                  }`}>
                  <span className={`material-symbols-outlined text-stat-xl font-bold ${isComputing ? 'animate-spin' : ''}`}>
                    {isComputing ? "sync" : (apiError ? "error" : (!hasPredicted ? "hourglass_empty" : "check_circle"))}
                  </span>
                  <span className="font-data-tabular text-data-tabular uppercase tracking-widest text-stat-xl font-bold">
                    {isComputing ? "Re-Evaluating..." : (apiError ? `Error: ${apiError}` : projectedWinnerLabel)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
