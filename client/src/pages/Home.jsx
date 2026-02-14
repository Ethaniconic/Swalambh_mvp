import Hero from '../components/Hero'
import TriageCard from '../components/TriageCard'
import Faq from '../components/Faq'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <Hero />
      <TriageCard />
      <Faq />
    </div>
  )
}

export default Home
