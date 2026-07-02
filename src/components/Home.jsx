import React from 'react'

export default function ModelArchitecture({ onNavigate }) {
  const cards = [
    {
      title: "Model Architecture",
      description: "Ensemble machine learning model combining XGBoost, Random Forest, and Gradient Boosting with soft voting for accurate football match outcome prediction.",
      icon: "schema",
      bgIcon: "account_tree",
      colorClass: "primary",
    },
    {
      title: "Data Processing",
      description: "Analyzes historical match data using team strength, recent form, win rates, draw trends, tournament context, and home advantage through advanced feature engineering.",
      icon: "dns",
      bgIcon: "database",
      colorClass: "secondary",
    },
    {
      title: "Historical Validation",
      description: "Validated using stratified cross-validation and optimized with SMOTE-Tomek resampling to deliver balanced Home Win, Draw, and Away Win predictions.",
      icon: "verified",
      bgIcon: "history",
      colorClass: "tertiary",
    }
  ];

  return (
    <div className="flex flex-col gap-section-margin">
      {/* Hero Section */}
      <section className="relative w-full rounded-[2rem] overflow-hidden border border-white/10 bg-surface-container-low min-h-[550px] flex items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 z-0">
          <img
            alt="Elite Stadium"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvfVpFQs-5Ycy3kXH8GINZmQMLdBSM4Gn2u5n_UOgTVGQZ80t34FAnxQsJCqloAv9gkSgUpTbtmQMMIqoBzrRqH1ZOhg38OZwilqlyL7c6Ce6xowJs_wLfSy0pUdNTbfCqtMASAMeHFfjU-iffCMeHNbyW4Tk2gk9K3ytEqWO0HjWxMSANQ4VvtAbYbanZyeDLS_7H1DImKxd8rVOt7yqXU4jKXkO6DIXJuseNeS7-YdlG2Kf2dFJbqnAEIHpQ-fCJBlJBAnjYBh54"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Match Engine Active</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface drop-shadow-lg leading-tight">
            International Match Prediction
            <br />
            <span className="text-primary">Powered by AI Win Probability Model</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
            Harness elite neural networks and high-fidelity pitch data to gain an unassailable edge in football forecasting. Professional insights for high-performance clubs and analysts.
          </p>
          <button
            onClick={() => onNavigate('predict')}
            className="mt-4 bg-primary text-on-primary font-label-caps text-label-caps px-8 py-4 rounded-full uppercase tracking-wider hover:bg-primary-fixed transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(173,198,255,0.3)]"
          >
            Access Match Intelligence
          </button>
        </div>
      </section>

      {/* Advanced Pitch Metrics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Advanced Football Intelligence</h2>
          <p className="text-on-surface-variant text-body-md">
            Powered by XGBoost Football Ensemble v1.0, our prediction engine leverages advanced feature engineering and ensemble learning to evaluate team performance, historical trends, and match context, delivering reliable Home Win, Draw, and Away Win probabilities.
          </p>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5" data-icon="check_circle">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">Multi-Model Ensemble Engine</span>
                <span className="text-on-surface-variant text-sm">XGBoost, Random Forest, and Gradient Boosting combined for higher predictive accuracy.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5" data-icon="check_circle">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">Historical Performance Intelligence</span>
                <span className="text-on-surface-variant text-sm">Analyzes team form, win rates, draw trends, home advantage, and tournament context.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5" data-icon="check_circle">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">Smart Probability Calibration</span>
                <span className="text-on-surface-variant text-sm">Generates balanced outcome probabilities using feature engineering and advanced resampling techniques.</span>
              </div>
            </li>
          </ul>
        </div>
        <div className="order-1 lg:order-2 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
          <img
            alt="Pitch Metrics"
            className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5gxOWjE-X3bSyckFKwRB4po3P27rpoewC5vlpRjJifh1GqW3s2hj5zYq9JQsdGI4rr6l5mCvO8TboPvMUmdS9Yf2pDmQMKtxYVwq_5KjqwDzgi_jAylz47QaeW7nLuSdVoJVIOXNKpSKyLQ84AaDaeibYTHxQ8sUhEPsJLqBiCZUWOxMc2qpqG_5RsxYANw9Zu_d52BARqnbcTmbXizga2b_He05iAtCcBsh6xPpUy7y2agFGtTlXCmXJXXc6Jtz_lhrKiPvlimfA"
          />
        </div>
      </section>

      {/* Neural Engine Architecture Section */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 max-w-4xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Ensemble Prediction Architecture</h2>
            <p className="text-on-surface-variant text-body-md">
              Powering our predictions is a machine learning ensemble built on historical football data. By combining statistical feature engineering with multiple predictive algorithms, the model evaluates team strength, recent form, and match context to generate reliable outcome probabilities.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
          {cards.map((card, idx) => {
            let containerBg = "";
            let iconColor = "";
            let borderHover = "";

            if (card.colorClass === 'primary') {
              containerBg = "bg-primary/10 border-primary/20 text-primary";
              iconColor = "text-primary";
              borderHover = "hover:border-primary/30";
            } else if (card.colorClass === 'secondary') {
              containerBg = "bg-secondary/10 border-secondary/20 text-secondary";
              iconColor = "text-secondary";
              borderHover = "hover:border-secondary/30";
            } else {
              containerBg = "bg-tertiary/10 border-tertiary/20 text-tertiary";
              iconColor = "text-tertiary";
              borderHover = "hover:border-tertiary/30";
            }

            return (
              <div
                key={idx}
                className={`bg-surface-container-low border border-white/5 rounded-2xl p-8 flex flex-col gap-6 group transition-all duration-500 relative overflow-hidden ${borderHover}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl" data-icon={card.bgIcon}>
                    {card.bgIcon}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${containerBg}`}>
                  <span className="material-symbols-outlined" data-icon={card.icon}>
                    {card.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-3 relative z-10">
                  <h3 className="font-semibold text-on-surface text-lg">{card.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
