import Faq from '../components/Faq'
import './Safety.css'

const safetyFaq = [
  {
    question: 'How are high-risk cases handled?',
    answer: 'Cases with elevated risk are flagged for clinician review and follow-up.',
  },
  {
    question: 'What if the photo is unclear?',
    answer: 'Quality checks prompt a retake to avoid misleading outputs.',
  },
  {
    question: 'Can clinicians override the summary?',
    answer: 'Yes. The system is designed to support, not replace, clinical judgment.',
  },
]

function Safety() {
  return (
    <section className="safety">
      <header className="safety__header">
        <p className="safety__eyebrow">Safety</p>
        <h1>Designed for caution and clarity.</h1>
        <p className="safety__lead">
          DermSight flags uncertainty and encourages clinician review for
          high-risk or ambiguous cases.
        </p>
      </header>

      <div className="safety__visual" aria-hidden="true">
        <svg viewBox="0 0 520 240" role="img" focusable="false">
          <rect x="32" y="36" width="160" height="128" rx="18" fill="#FFFFFF" stroke="#D9E6EE" strokeWidth="2" />
          <path d="M70 78h84" stroke="#2FC1E2" strokeWidth="12" strokeLinecap="round" />
          <path d="M70 106h64" stroke="#CFEFF9" strokeWidth="10" strokeLinecap="round" />
          <path d="M70 130h72" stroke="#CFEFF9" strokeWidth="10" strokeLinecap="round" />
          <circle cx="284" cy="106" r="56" fill="#E7F6FF" />
          <path d="M284 70l40 12v28c0 26-18 50-40 60-22-10-40-34-40-60V82l40-12Z" fill="#42E1BF" />
          <rect x="372" y="52" width="120" height="96" rx="20" fill="#E6FBF4" />
          <circle cx="432" cy="100" r="18" fill="#2FC1E2" />
        </svg>
      </div>

      <div className="safety__grid">
        <article className="safety__card">
          <h3>Uncertainty alerts</h3>
          <p>Confidence bands are visible on every triage output.</p>
        </article>
        <article className="safety__card">
          <h3>Retake guidance</h3>
          <p>Quality checks request clearer images before analysis.</p>
        </article>
        <article className="safety__card">
          <h3>Human escalation</h3>
          <p>High-risk signs trigger a recommended clinician follow-up.</p>
        </article>
      </div>
      <Faq
        title="Safety questions"
        lead="Clear guardrails keep the triage process responsible."
        items={safetyFaq}
      />
    </section>
  )
}

export default Safety
