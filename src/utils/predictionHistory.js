const STORAGE_KEY = "user_predictions";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pred_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizePrediction(item, index = 0) {
  if (!item || typeof item !== "object") return null;

  const homeTeam = item.homeTeam || "Unknown";
  const awayTeam = item.awayTeam || "Unknown";
  const tournament = item.tournament || item.league || "International Match";
  const stadiumCountry = item.stadiumCountry || "";
  const neutralVenue = Boolean(item.neutralVenue);

  const hasDetailedProbs =
    typeof item.homeWin === "number" &&
    typeof item.draw === "number" &&
    typeof item.awayWin === "number";

  const homeWin = hasDetailedProbs ? item.homeWin : null;
  const draw = hasDetailedProbs ? item.draw : null;
  const awayWin = hasDetailedProbs ? item.awayWin : null;

  let projectedOutcome = item.projectedOutcome || item.target || "Draw";
  let projectedWinner = item.projectedWinner;
  if (!projectedWinner) {
    if (projectedOutcome === "Home Win") projectedWinner = "home";
    else if (projectedOutcome === "Away Win") projectedWinner = "away";
    else projectedWinner = "draw";
  }

  let confidence = typeof item.confidence === "number" ? item.confidence : null;
  if (confidence === null && hasDetailedProbs) {
    confidence = Math.max(homeWin, draw, awayWin);
  } else if (confidence === null && typeof item.odds === "string") {
    const parsed = parseFloat(item.odds.replace("%", ""));
    if (!Number.isNaN(parsed)) confidence = parsed;
  }

  let timestamp = item.timestamp;
  if (!timestamp && item.date) {
    const parsedDate = Date.parse(item.date);
    timestamp = !Number.isNaN(parsedDate)
      ? new Date(parsedDate).toISOString()
      : new Date().toISOString();
  } else if (!timestamp) {
    timestamp = new Date().toISOString();
  }

  const date =
    item.date ||
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return {
    id: item.id || `legacy_${index}_${homeTeam}_${awayTeam}_${date}`,
    timestamp,
    date,
    homeTeam,
    awayTeam,
    tournament,
    stadiumCountry,
    neutralVenue,
    homeWin,
    draw,
    awayWin,
    projectedOutcome,
    projectedWinner,
    confidence,
  };
}

export function getPredictionHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, idx) => normalizePrediction(item, idx))
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Failed to load local prediction history:", error);
    return [];
  }
}

export function savePrediction({
  homeTeam,
  awayTeam,
  tournament,
  stadiumCountry,
  neutralVenue,
  homeWin,
  draw,
  awayWin,
}) {
  let projectedWinner = "draw";
  let projectedOutcome = "Draw";

  if (homeWin > draw && homeWin > awayWin) {
    projectedWinner = "home";
    projectedOutcome = "Home Win";
  } else if (awayWin > draw && awayWin > homeWin) {
    projectedWinner = "away";
    projectedOutcome = "Away Win";
  }

  const now = new Date();
  const entry = {
    id: generateId(),
    timestamp: now.toISOString(),
    date: now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    homeTeam,
    awayTeam,
    tournament,
    stadiumCountry,
    neutralVenue: Boolean(neutralVenue),
    homeWin,
    draw,
    awayWin,
    projectedOutcome,
    projectedWinner,
    confidence: Math.round(Math.max(homeWin, draw, awayWin) * 100) / 100,
  };

  try {
    const existing = getPredictionHistory();
    const updated = [entry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (error) {
    console.error("Failed to save prediction to localStorage:", error);
    return null;
  }
}

export function deletePrediction(id) {
  try {
    const existing = getPredictionHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to delete prediction from localStorage:", error);
    return getPredictionHistory();
  }
}

export function clearPredictionHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error("Failed to clear prediction history:", error);
    return [];
  }
}

