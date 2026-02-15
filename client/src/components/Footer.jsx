import logo from '../assets/favicon.jpg'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="telehealth">
      <div className="footer__brand">
        <span className="footer__badge" aria-hidden="true">
          <img className="footer__logo" src={logo} alt="" />
        </span>
        <div>
          <p className="footer__title">DermSight</p>
          <p className="footer__subtitle">Early guidance with safety in mind.</p>
        </div>
      </div>
      <div className="footer__note">
        <p>For informational guidance only. Not a medical diagnosis.</p>
        <span>2026 DermSight</span>
      </div>
      <p className="footer__tagline">
        DermSight AI — Powered by EfficientNet-B2 · Fine-tuned on PAD-UFES clinical data
      </p>
    </footer>
  )
}

export default Footer
