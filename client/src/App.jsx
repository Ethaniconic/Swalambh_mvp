import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import TriageCard from './components/TriageCard'
import Faq from './components/Faq'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import Workflow from './pages/Workflow'
import Safety from './pages/Safety'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [direction, setDirection] = useState('forward')
  const [authMode, setAuthMode] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const pageOrder = ['home', 'features', 'workflow', 'safety']

  const handleNavigate = (nextPage) => {
    if (nextPage === page) {
      return
    }

    const currentIndex = pageOrder.indexOf(page)
    const nextIndex = pageOrder.indexOf(nextPage)
    const nextDirection = nextIndex > currentIndex ? 'forward' : 'back'

    setDirection(nextDirection)
    setPage(nextPage)
  }

  return (
    <Router>
      <Navbar
        currentPage={page}
        onNavigate={handleNavigate}
        onAuthOpen={setAuthMode}
        isAuthed={isAuthed}
      />
      <main className="page">
        <div key={page} className={`page__content page__content--${direction}`}>
          {page === 'features' && <Features />}
          {page === 'workflow' && <Workflow onNavigate={handleNavigate} />}
          {page === 'safety' && <Safety />}
          {page === 'home' && <Home isAuthed={isAuthed} onAuthOpen={setAuthMode} />}
        </div>
      </main>
      <Footer />
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={setAuthMode}
          onAuthSuccess={() => {
            setIsAuthed(true)
            setAuthMode(null)
            handleNavigate('home')
          }}
        />
      )}
    </Router>
  )
}

export default App
