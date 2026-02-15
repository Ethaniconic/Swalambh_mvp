import './ActionBanner.css'

function ActionBanner({
  eyebrow = 'Next step',
  title = 'Ready to start a triage?',
  subtitle = 'Invite patients to upload images or share reports with clinicians.',
  primaryLabel = 'Start Triage',
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
}) {
  return (
    <section className="banner">
      <div className="banner__content">
        <p className="banner__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="banner__lead">{subtitle}</p>
      </div>
      <div className="banner__actions">
        <button className="banner__primary" type="button" onClick={onPrimaryClick}>
          {primaryLabel}
        </button>
        {secondaryLabel && (
          <button className="banner__secondary" type="button" onClick={onSecondaryClick}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </section>
  )
}

export default ActionBanner
