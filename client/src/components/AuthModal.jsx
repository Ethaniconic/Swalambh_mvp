import './AuthModal.css'

function AuthModal({ mode = 'login', onClose, onSwitch }) {
  const config = {
    login: {
      eyebrow: 'Secure access',
      title: 'Welcome back to DermSight.',
      lead: 'Sign in to continue triage and review case summaries.',
      primary: 'Sign in',
      secondary: 'Create account',
    },
    signup: {
      eyebrow: 'Create account',
      title: 'Set up your DermSight workspace.',
      lead: 'Invite your team and start triage in minutes.',
      primary: 'Create account',
      secondary: 'Sign in',
    },
    forgot: {
      eyebrow: 'Password recovery',
      title: 'Reset your access securely.',
      lead: 'We will email a one-time reset link to your inbox.',
      primary: 'Send reset link',
      secondary: 'Back to sign in',
    },
  }

  const content = config[mode] || config.login

  return (
    <div className="auth" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth__backdrop" type="button" onClick={onClose}>
        <span className="sr-only">Close</span>
      </button>
      <div className={`auth__panel auth__panel--${mode}`}>
        <div className="auth__header">
          <p className="auth__eyebrow">{content.eyebrow}</p>
          <h2 id="auth-title">{content.title}</h2>
          <p className="auth__lead">{content.lead}</p>
        </div>

        <div className="auth__body">
          <div className="auth__form">
            {mode === 'signup' && (
              <>
                <label className="auth__label" htmlFor="name">
                  Full name
                </label>
                <input id="name" className="auth__input" placeholder="Alex Morgan" />
              </>
            )}
            {mode === 'signup' && (
              <>
                <label className="auth__label" htmlFor="role">
                  Role
                </label>
                <select id="role" className="auth__input" defaultValue="">
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="clinician">Clinician</option>
                  <option value="triage">Triage coordinator</option>
                  <option value="ops">Operations</option>
                </select>
              </>
            )}
            <label className="auth__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="auth__input"
              type="email"
              placeholder="alex@clinic.com"
            />
            {mode !== 'forgot' && (
              <>
                <label className="auth__label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="auth__input"
                  type="password"
                  placeholder="Enter password"
                />
              </>
            )}

            <button className="auth__primary" type="button">
              {content.primary}
            </button>

            {mode === 'login' && (
              <button
                className="auth__link"
                type="button"
                onClick={() => onSwitch('forgot')}
              >
                Forgot password?
              </button>
            )}

            <button
              className="auth__secondary"
              type="button"
              onClick={() =>
                onSwitch(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup')
              }
            >
              {content.secondary}
            </button>
          </div>

          <div className="auth__aside">
            {mode === 'login' && (
              <>
                <p className="auth__aside-title">Session pulse</p>
                <ul>
                  <li>Device check + secure session.</li>
                  <li>Recent case summaries ready.</li>
                  <li>One-click triage resume.</li>
                </ul>
              </>
            )}
            {mode === 'signup' && (
              <>
                <p className="auth__aside-title">Launch checklist</p>
                <ul>
                  <li>Create your clinic workspace.</li>
                  <li>Invite collaborators.</li>
                  <li>Configure triage rules.</li>
                </ul>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <p className="auth__aside-title">Recovery beacon</p>
                <ul>
                  <li>Reset links expire in 15 minutes.</li>
                  <li>We never store passwords in plain text.</li>
                  <li>Need help? Contact support.</li>
                </ul>
              </>
            )}
          </div>
        </div>

        <button className="auth__close" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default AuthModal
