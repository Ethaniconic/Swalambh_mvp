import './SampleReportModal.css'

function SampleReportModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="sample-modal" role="dialog" aria-modal="true">
      <div className="sample-modal__scrim" onClick={onClose} />
      <div className="sample-modal__panel">
        <header className="sample-modal__header">
          <h3>Sample Triage Report</h3>
          <button className="sample-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="sample-modal__body">
          <p className="sample-modal__meta">Case ID: #DS-2026-001</p>
          <ul>
            <li><strong>Risk Level:</strong> Moderate</li>
            <li><strong>Key Visual Cues:</strong> Asymmetry, irregular border</li>
            <li><strong>Suggested Next Step:</strong> Telehealth consult within 48 hours</li>
            <li><strong>Confidence Range:</strong> 0.72–0.81</li>
          </ul>
          <p className="sample-modal__note">
            For guidance only. Not a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SampleReportModal