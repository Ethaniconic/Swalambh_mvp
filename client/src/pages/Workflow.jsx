import ActionBanner from '../components/ActionBanner'
import './Workflow.css'

function Workflow() {
  return (
    <section className="workflow">
      <header className="workflow__header">
        <p className="workflow__eyebrow">Workflow</p>
        <h1>From photo to triage in minutes.</h1>
        <p className="workflow__lead">
          A simple flow that keeps patients guided and clinicians informed.
        </p>
      </header>

      <div className="workflow__visual" aria-hidden="true">
        <svg viewBox="0 0 520 240" role="img" focusable="false">
          <rect x="24" y="24" width="140" height="140" rx="18" fill="#E7F6FF" />
          <rect x="48" y="52" width="92" height="18" rx="9" fill="#2FC1E2" />
          <rect x="48" y="82" width="70" height="12" rx="6" fill="#BFE9F5" />
          <rect x="48" y="104" width="88" height="12" rx="6" fill="#BFE9F5" />
          <circle cx="238" cy="94" r="46" fill="#E6FBF4" />
          <circle cx="238" cy="94" r="24" fill="#42E1BF" />
          <rect x="320" y="40" width="176" height="124" rx="20" fill="#FFFFFF" stroke="#D9E6EE" strokeWidth="2" />
          <rect x="346" y="68" width="120" height="12" rx="6" fill="#2FC1E2" />
          <rect x="346" y="94" width="92" height="10" rx="5" fill="#CFEFF9" />
          <rect x="346" y="114" width="110" height="10" rx="5" fill="#CFEFF9" />
        </svg>
      </div>

      <div className="workflow__steps">
        <article className="workflow__card">
          <h3>1. Capture</h3>
          <p>Patients upload clear photos and share symptom notes.</p>
        </article>
        <article className="workflow__card">
          <h3>2. Analyze</h3>
          <p>EfficientNet-B0 screens for lesion patterns and risk signals.</p>
        </article>
        <article className="workflow__card">
          <h3>3. Summarize</h3>
          <p>Structured findings with confidence bands and next steps.</p>
        </article>
      </div>
      <ActionBanner
        eyebrow="Ready to triage"
        title="Guide patients to their next step."
        subtitle="Kick off a new case and get a structured summary in minutes."
        primaryLabel="Start Triage"
        secondaryLabel="View Sample Report"
      />
    </section>
  )
}

export default Workflow
