import React, { useState } from 'react'
import Home from './components/Home.jsx'
import ModelArchitecture from './components/Home.jsx'
import Predictor from './components/Predictor.jsx'
import History from './components/History.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />
      case 'predict':
        return <Predictor />
      case 'history':
        return <History onNavigate={setCurrentPage} />
      default:
        return <Home onNavigate={setCurrentPage} />
    }
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'predict', label: 'Predictor Engine' },
    { id: 'history', label: 'Prediction History' }
  ]

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between px-container-padding h-20 max-w-7xl mx-auto w-full">
          {/* Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>
            <span className="material-symbols-outlined text-primary text-3xl fill">analytics</span>
            <span className="font-display-lg text-headline-lg font-bold text-primary tracking-tighter">FootPredict</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`cursor-pointer transition-all duration-300 font-medium ${isActive
                    ? 'text-primary font-bold border-b-2 border-primary pb-1 active:scale-95'
                    : 'text-on-surface-variant hover:text-primary active:scale-95'
                    }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container border-b border-white/10 px-6 py-4 flex flex-col gap-4 shadow-xl">
            {navItems.map(item => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 font-medium transition-colors w-full ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                    }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-28 pb-section-margin px-container-padding md:px-section-margin max-w-7xl mx-auto w-full flex flex-col gap-8 relative z-10">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-12 border-t border-outline-variant flat no shadows mt-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-section-margin max-w-7xl mx-auto gap-6 w-full">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-lg">
              FootPredict
            </span>
            <span className="font-body-md text-[13px] text-outline text-center md:text-left">
              © 2026 FootPredict AI. Precision-Engineered Performance.
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-body-md text-on-surface-variant">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className="hover:text-secondary transition-colors opacity-80 hover:opacity-100 text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-6 font-body-md text-sm text-on-surface-variant">
            <a href="#" className="hover:text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-secondary transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
