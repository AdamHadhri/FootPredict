# FootPredict — International Match Prediction AI

**FootPredict** is a modern web application for predicting international football match outcomes (**Home Win**, **Draw**, and **Away Win** probabilities) powered by a machine learning ensemble backend (**XGBoost**, **Random Forest**, and **Gradient Boosting**).

---

## Features

- **International Match Predictor Engine**
  - Select any **Home Team**, **Away Team**, **Tournament Environment** (`UEFA European Championship`, `FIFA World Cup`, `UEFA Nations League`, `International Friendly`), and **Stadium Country**.
  - Toggle **Neutral Venue** mode to adjust home-advantage weighting.
  - Real-time **Home Win / Draw / Away Win** probability bars with national team flags and a projected winner highlight.
- **Private Local Prediction History**
  - Every prediction is automatically saved locally in each user's browser (`localStorage`), keeping history private per user/device.
  - Live analytics cards: **Total Predictions**, **Average Top Probability** (SVG gauge), and **Projected Outcomes Split** (Home / Draw / Away).
  - Filter and search saved predictions by **Tournament**, **Outcome**, **Timeframe** (`Today`, `Last 7 Days`, `Last 30 Days`, `All Time`), or team/host country.
  - Delete individual entries or clear all local history with confirmation.
- **Model Architecture Overview**
  - Dedicated landing view explaining the multi-model ensemble pipeline, feature engineering, and stratified cross-validation with SMOTE-Tomek resampling.
- **Responsive Dark Glassmorphic UI**
  - Built with React, Vite, Tailwind CSS, Material Symbols, and dynamic national flag rendering via FlagCDN.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3 (`@tailwindcss/forms`, `@tailwindcss/container-queries`) |
| Icons & Assets | Google Material Symbols Outlined, FlagCDN |
| Persistence | Browser `localStorage` (per-user local history) |
| ML Prediction API | REST API (`POST /predict`) serving XGBoost Ensemble v1.0 |

---

## Project Structure

```text
FootPredict/
├── public/
│   └── analytics.svg               # App favicon
├── src/
│   ├── components/
│   │   ├── Home.jsx                # Landing page & model architecture overview
│   │   ├── Predictor.jsx           # Interactive international match predictor
│   │   └── History.jsx             # Per-user local prediction history & analytics
│   ├── utils/
│   │   └── predictionHistory.js    # localStorage read/save/delete/clear helpers
│   ├── App.jsx                     # Navigation bar, layout, and page routing
│   ├── index.css                   # Tailwind imports & custom glass/glow utilities
│   └── main.jsx                    # React entry point
├── countries.json                  # Country names and ISO codes for team/host lists & flags
├── index.html                      # HTML shell, fonts, and Material Symbols
├── tailwind.config.js              # Custom color tokens, typography, and spacing
├── vite.config.js                  # Vite configuration (dev server on port 5000)
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FootPredict

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server (runs on http://localhost:5000)
npm run dev
```

### Building for Production

```bash
# Create an optimized production build in dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Prediction API

The Predictor Engine sends a `POST` request to the prediction endpoint:

```http
POST https://web-production-cd067.up.railway.app/predict
Content-Type: application/json
```

**Request Body:**

```json
{
  "home_team": "France",
  "away_team": "Germany",
  "tournament": "UEFA European Championship",
  "country": "France",
  "neutral": false
}
```

**Expected Response:**

```json
{
  "home_win": 0.48,
  "draw": 0.27,
  "away_win": 0.25
}
```

*(Both decimal `[0, 1]` and percentage `[0, 100]` response values are supported by the frontend.)*

---

## License

This project is open source and available under the [MIT License](LICENSE).

