import { useEffect, useState } from 'react'
import './AuthModal.css'

function AuthModal({ mode = 'login', onClose, onSwitch, onAuthSuccess }) {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const passwordChecks = [
    { label: 'At least 8 characters', test: /.{8,}/ },
    { label: 'One uppercase letter', test: /[A-Z]/ },
    { label: 'One number', test: /\d/ },
    { label: 'One special character', test: /[^A-Za-z0-9]/ },
  ]

  useEffect(() => {
    setStatus({ type: 'idle', message: '' })
    setIsSubmitting(false)
    setFullName('')
    setRole('')
    setEmail('')
    setPassword('')
  }, [mode])

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setStatus({ type: 'idle', message: '' })

    try {
      if (mode === 'signup') {
        const response = await fetch(`${apiBase}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            full_name: fullName || undefined,
            role: role || undefined,
            password,
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.detail || 'Signup failed')
        }

        setStatus({ type: 'success', message: 'Account created. You can sign in now.' })
        onSwitch('login')
        return
      }

      if (mode === 'login') {
        const response = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.detail || 'Login failed')
        }

        setStatus({ type: 'success', message: 'Signed in successfully.' })
        if (onAuthSuccess) {
          onAuthSuccess()
        }
        return
      }

      const response = await fetch(`${apiBase}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.detail || 'Request failed')
      }

      setStatus({ type: 'success', message: 'Reset link sent if the email exists.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <input
                  id="name"
                  className="auth__input"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </>
            )}
            {mode === 'signup' && (
              <>
                <label className="auth__label" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="auth__input"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="patient">Patient</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="guardian">Parent or guardian</option>
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {mode === 'signup' && (
                  <ul className="auth__rules">
                    {passwordChecks.map((rule) => {
                      const isMet = rule.test.test(password)
                      return (
                        <li
                          key={rule.label}
                          className={`auth__rule ${isMet ? 'is-met' : 'is-miss'}`}
                        >
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            )}

            {status.message && (
              <div className={`auth__status auth__status--${status.type}`}>
                {status.message}
              </div>
            )}

            <button
              className="auth__primary"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
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
              disabled={isSubmitting}
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
