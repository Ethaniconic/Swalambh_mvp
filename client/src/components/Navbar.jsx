import logo from '../assets/favicon.jpg'
import './Navbar.css'

function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="nav">
      <div className="nav__brand">
        <span className="nav__badge" aria-hidden="true">
          <img className="nav__logo" src={logo} alt="" />
        </span>
        <div>
          <p className="nav__title">DermSight</p>
          <p className="nav__subtitle">Pre-Clinical Multimodal Triage</p>
        </div>
      </div>

      <nav className="nav__links">
        <button
          type="button"
          className={`nav__link ${currentPage === 'home' ? 'is-active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={`nav__link ${currentPage === 'features' ? 'is-active' : ''}`}
          onClick={() => onNavigate('features')}
        >
          Features
        </button>
        <button
          type="button"
          className={`nav__link ${currentPage === 'workflow' ? 'is-active' : ''}`}
          onClick={() => onNavigate('workflow')}
        >
          Workflow
        </button>
        <button
          type="button"
          className={`nav__link ${currentPage === 'safety' ? 'is-active' : ''}`}
          onClick={() => onNavigate('safety')}
        >
          Safety
        </button>
        <button
          type="button"
          className={`nav__link ${currentPage === 'telehealth' ? 'is-active' : ''}`}
          onClick={() => onNavigate('telehealth')}
        >
          Telehealth
        </button>
      </nav>

      <div className="nav__actions">
        <button className="nav__ghost">Sign in</button>
        <button className="nav__cta">Start Triage</button>
      </div>
    </header>
  )
}

export default Navbar
