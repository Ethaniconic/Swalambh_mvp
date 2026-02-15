import Faq from '../components/Faq'
import './Safety.css'

const safetyFaq = [
  {
    question: 'Is DermSight a medical diagnosis tool?',
    answer:
      'No. DermSight is a triage aid that suggests risk levels. It does not replace professional dermatological evaluation. Always consult a qualified healthcare provider for a definitive diagnosis.',
  },
  {
    question: 'How does the safety-net escalation work?',
    answer:
      'If the model assigns more than 30 % probability to the High-risk class, the final result is automatically escalated to High regardless of the top prediction. This ensures potentially dangerous lesions are never under-triaged.',
  },
  {
    question: 'What happens when my symptoms flag danger signs?',
    answer:
      'When two or more danger-associated symptoms (rapid growth, bleeding, colour change, ulceration, etc.) are selected, the system applies a symptom-aware boost that increases the High-risk score, adding a clinical context layer on top of image analysis.',
  },
  {
    question: 'Why does the model use Test-Time Augmentation?',
    answer:
      'Each uploaded image is evaluated from three augmented perspectives (original, horizontal flip, slight rotation). Averaging the predictions reduces sensitivity to photo angle and lighting, producing more stable results.',
  },
  {
    question: 'Is my data stored or shared?',
    answer:
      'Uploaded images are processed in memory for inference and are not persisted on the server after the response is returned. Account credentials are stored securely in MongoDB with hashed passwords.',
  },
]

function Safety() {
  return (
    <section className="safety">
      <header className="safety__header">
        <p className="safety__eyebrow">Safety &amp; Trust</p>
        <h1>Built to err on the side of caution.</h1>
        <p className="safety__lead">
          Multiple layers of protection ensure high-risk cases are never
          under-triaged, and every result is transparent about its limitations.
        </p>
      </header>

      {/* ---- safety pillars ---- */}
      <div className="safety__grid">
        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--escalate">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3>Automatic Escalation</h3>
          <p>
            If the model detects &gt;30 % High-risk probability, the result is
            escalated regardless of the leading class — a safety net that
            prioritises patient wellbeing.
          </p>
        </article>

        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--tta">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3>Multi-View Stability</h3>
          <p>
            Test-Time Augmentation runs each image through 3 augmented views
            and averages the predictions, reducing noise from lighting, angle
            or focus issues.
          </p>
        </article>

        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--symptom">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <h3>Symptom-Aware Scoring</h3>
          <p>
            Selecting two or more danger symptoms (bleeding, rapid growth,
            ulceration) triggers an additional risk boost, combining clinical
            context with visual analysis.
          </p>
        </article>

        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--auth">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3>Authenticated Access</h3>
          <p>
            Triage is gated behind login. This prevents anonymous misuse and
            ensures every analysis is tied to a verified account.
          </p>
        </article>

        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--explain">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <h3>Transparent Explanations</h3>
          <p>
            Every result includes a plain-language AI explanation powered by
            LLaMA 3.3 70B, so you understand <em>why</em> a risk level was
            assigned — not just what it is.
          </p>
        </article>

        <article className="safety__card">
          <div className="safety__card-icon safety__card-icon--disclaimer">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3>Not a Diagnosis</h3>
          <p>
            DermSight is explicitly labelled as a screening aid. The report
            encourages professional consultation and never claims diagnostic
            authority.
          </p>
        </article>
      </div>

      <Faq
        title="Safety &amp; Privacy FAQ"
        lead="Answers to common questions about how DermSight protects you."
        items={safetyFaq}
      />
    </section>
  )
}

export default Safety
