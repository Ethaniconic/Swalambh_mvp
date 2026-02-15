import ActionBanner from '../components/ActionBanner'
import './Workflow.css'

function Workflow({ onNavigate }) {
  return (
    <section className="workflow">
      <header className="workflow__header">
        <p className="workflow__eyebrow">How It Works</p>
        <h1>From photo to insight in under a minute.</h1>
        <p className="workflow__lead">
          Four clear steps — upload, analyze, explain, review. No guesswork, no
          waiting rooms.
        </p>
      </header>

      {/* ---- pipeline visual ---- */}
      <div className="workflow__pipeline">
        <div className="pipeline__node">
          <div className="pipeline__icon pipeline__icon--upload">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span className="pipeline__label">Upload</span>
        </div>
        <span className="pipeline__arrow">→</span>
        <div className="pipeline__node">
          <div className="pipeline__icon pipeline__icon--model">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <span className="pipeline__label">Model</span>
        </div>
        <span className="pipeline__arrow">→</span>
        <div className="pipeline__node">
          <div className="pipeline__icon pipeline__icon--explain">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="pipeline__label">Explain</span>
        </div>
        <span className="pipeline__arrow">→</span>
        <div className="pipeline__node">
          <div className="pipeline__icon pipeline__icon--report">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span className="pipeline__label">Report</span>
        </div>
      </div>

      {/* ---- step cards ---- */}
      <div className="workflow__steps">
        <article className="workflow__card">
          <span className="workflow__step-num">01</span>
          <h3>Upload &amp; Describe</h3>
          <p>
            Take or select a clear photo of the skin area. Then pick any
            matching symptoms — itching, bleeding, rapid growth, colour change
            and more — from the smart autocomplete list.
          </p>
        </article>
        <article className="workflow__card">
          <span className="workflow__step-num">02</span>
          <h3>AI Classification</h3>
          <p>
            Your image is processed by <strong>EfficientNet-B2</strong>, fine-tuned
            on clinical dermatology data. The model runs <strong>Test-Time Augmentation</strong> (3
            augmented views) and applies <strong>symptom-aware risk scoring</strong> to
            produce a Low / Medium / High risk level with confidence
            percentages.
          </p>
        </article>
        <article className="workflow__card">
          <span className="workflow__step-num">03</span>
          <h3>Plain-Language Explanation</h3>
          <p>
            The classification is sent to <strong>LLaMA 3.3 70B</strong> (via
            Groq) which generates a clear, jargon-free explanation of what the
            risk level means and what steps to consider next.
          </p>
        </article>
        <article className="workflow__card">
          <span className="workflow__step-num">04</span>
          <h3>Side-by-Side Report</h3>
          <p>
            You receive a split-screen view: the clinical diagnosis card on the
            left (risk level, confidence bars, selected symptoms) and the AI
            explanation on the right — everything in one glance.
          </p>
        </article>
      </div>

      <ActionBanner
        eyebrow="Ready to try"
        title="See the workflow in action."
        subtitle="Upload a photo, add symptoms, and get your AI-powered triage report in seconds."
        primaryLabel="Start Triage"
        onPrimaryClick={() => onNavigate('home')}
        secondaryLabel="View Features"
        onSecondaryClick={() => onNavigate('features')}
      />
    </section>
  )
}

export default Workflow
