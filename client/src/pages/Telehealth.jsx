import ActionBanner from '../components/ActionBanner'
import './Telehealth.css'

function Telehealth() {
  return (
    <section className="telehealth">
      <header className="telehealth__header">
        <p className="telehealth__eyebrow">Telehealth</p>
        <h1>Connect triage to virtual care.</h1>
        <p className="telehealth__lead">
          Share summaries with clinicians, attach images, and keep follow-ups in
          one place.
        </p>
      </header>

      <div className="telehealth__visual" aria-hidden="true">
        <svg viewBox="0 0 520 240" role="img" focusable="false">
          <rect x="26" y="40" width="160" height="120" rx="20" fill="#E7F6FF" />
          <rect x="54" y="70" width="104" height="12" rx="6" fill="#2FC1E2" />
          <rect x="54" y="92" width="78" height="10" rx="5" fill="#CFEFF9" />
          <rect x="54" y="112" width="92" height="10" rx="5" fill="#CFEFF9" />
          <rect x="230" y="24" width="244" height="160" rx="24" fill="#FFFFFF" stroke="#D9E6EE" strokeWidth="2" />
          <circle cx="288" cy="82" r="26" fill="#42E1BF" />
          <rect x="328" y="64" width="116" height="12" rx="6" fill="#2FC1E2" />
          <rect x="328" y="90" width="92" height="10" rx="5" fill="#CFEFF9" />
          <rect x="328" y="112" width="120" height="10" rx="5" fill="#CFEFF9" />
        </svg>
      </div>

      <div className="telehealth__grid">
        <article className="telehealth__card">
          <h3>Case handoff</h3>
          <p>Export a structured report to telehealth platforms.</p>
        </article>
        <article className="telehealth__card">
          <h3>Async review</h3>
          <p>Clinicians can review notes and images before visits.</p>
        </article>
        <article className="telehealth__card">
          <h3>Follow-up plan</h3>
          <p>Patients get clear next steps and reminders.</p>
        </article>
      </div>
      <ActionBanner
        eyebrow="Telehealth ready"
        title="Share the triage summary instantly."
        subtitle="Send a structured report directly to clinicians or care teams."
        primaryLabel="Send Report"
        secondaryLabel="Connect Platform"
      />
    </section>
  )
}

export default Telehealth
