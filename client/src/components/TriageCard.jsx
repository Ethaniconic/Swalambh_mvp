import './TriageCard.css'

function TriageCard() {
  return (
    <section className="triage" id="triage">
      <header className="triage__header">
        <p className="triage__eyebrow">Quick Triage</p>
        <h2>Upload a clear photo and describe symptoms.</h2>
        <p className="triage__lead">
          Share a well-lit image and a short description for early guidance.
        </p>
      </header>

      <div className="triage__panel">
        <div className="triage__upload">
          <div className="triage__drop">
            <p className="triage__drop-title">Drop image here</p>
            <p className="triage__drop-text">JPG or PNG, max 10MB</p>
          </div>
          <button className="triage__ghost" type="button">
            Browse files
          </button>
        </div>

        <div className="triage__form">
          <label className="triage__label" htmlFor="symptoms">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            className="triage__textarea"
            placeholder="Itchy patch for 2 weeks, mild redness, no bleeding..."
            rows="5"
          />
          <div className="triage__actions">
            <button className="triage__primary" type="button">
              Start Triage
            </button>
            <button className="triage__secondary" type="button">
              Save Draft
            </button>
          </div>
          <p className="triage__disclaimer">
            For guidance only. Not a medical diagnosis.
          </p>
        </div>
      </div>
    </section>
  )
}

export default TriageCard
