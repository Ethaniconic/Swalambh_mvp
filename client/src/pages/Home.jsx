import { useState } from 'react'
import Hero from '../components/Hero'
import SampleReportModal from '../components/SampleReportModal'
import TriageCard from '../components/TriageCard'
import Faq from '../components/Faq'
import './Home.css'

function Home({ isAuthed, onAuthOpen }) {
  const [sampleOpen, setSampleOpen] = useState(false)

  const handleStartTriage = () => {
    const el = document.getElementById('triage')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSampleReport = () => {
    setSampleOpen(true)
  }

  return (
    <main className="home">
      <Hero onStartTriage={handleStartTriage} onSampleReport={handleSampleReport} />
      <TriageCard isAuthed={isAuthed} onRequireAuth={() => onAuthOpen('login')} />
      <Faq />
      <SampleReportModal open={sampleOpen} onClose={() => setSampleOpen(false)} />
    </main>
  )
}

export default Home
