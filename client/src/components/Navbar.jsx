import './Navbar.css'

function Navbar() {
  return (
    <header className="nav">
      <div className="nav__brand">
        <span className="nav__badge">DS</span>
        <div>
          <p className="nav__title">DermSight</p>
          <p className="nav__subtitle">Pre-Clinical Multimodal Triage</p>
        </div>
      </div>

      <nav className="nav__links">
        <a href="#features">Features</a>
        <a href="#workflow">Workflow</a>
        <a href="#safety">Safety</a>
        <a href="#telehealth">Telehealth</a>
      </nav>

      <div className="nav__actions">
        <button className="nav__ghost">Sign in</button>
        <button className="nav__cta">Start Triage</button>
      </div>
    </header>
  )
}

export default Navbar
