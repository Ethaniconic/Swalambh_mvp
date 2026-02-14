import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Features from './pages/Features'
import Workflow from './pages/Workflow'
import Safety from './pages/Safety'
import Telehealth from './pages/Telehealth'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [direction, setDirection] = useState('forward')
  const pageOrder = ['home', 'features', 'workflow', 'safety', 'telehealth']

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
    <div className="app">
      <Navbar currentPage={page} onNavigate={handleNavigate} />
      <main className="page">
        <div key={page} className={`page__content page__content--${direction}`}>
          {page === 'features' && <Features />}
          {page === 'workflow' && <Workflow />}
          {page === 'safety' && <Safety />}
          {page === 'telehealth' && <Telehealth />}
          {page === 'home' && <Home />}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
