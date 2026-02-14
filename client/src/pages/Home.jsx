import './Home.css'

function Home() {
  return (
    <section className="hero" id="features">
      <div className="hero__content">
        <p className="hero__eyebrow">Bright, safe, explainable triage</p>
        <h1>DermSight brings images and symptoms together for early guidance.</h1>
        <p className="hero__lead">
          Multimodal intelligence helps patients communicate skin concerns, while
          clinicians receive early risk signals and transparent explanations.
        </p>
        <div className="hero__actions">
          <button className="hero__primary">Start a Quick Triage</button>
          <button className="hero__secondary">See Sample Report</button>
        </div>
      </div>
      <div className="hero__card" id="workflow">
        <div>
          <p className="hero__card-label">Today</p>
          <h2>3 min</h2>
          <p className="hero__card-text">
            Average time to generate a structured pre-clinical summary.
          </p>
        </div>
        <div className="hero__card-footer">
          <div>
            <p className="hero__card-label">Safety Focus</p>
            <p className="hero__card-text">High-risk cases are prioritized.</p>
          </div>
          <button className="hero__ghost">Review Triage Flow</button>
        </div>
      </div>
    </section>
  )
}

export default Home
