import { useRef, useState } from 'react'
import './TriageCard.css'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

const PAD_SYMPTOMS = [
  // from PAD-UFES metadata columns
  'itching', 'bleeding', 'growing', 'elevated', 'raised',
  'painful', 'burning', 'scaly', 'crusting', 'ulcerated',
  'irregular border', 'colour change', 'asymmetric',
  'diameter > 6mm', 'new lesion', 'sun-exposed area',
  'family history of melanoma', 'multiple moles',
  // PAD-UFES specific symptoms
  'hurt', 'itch', 'grew', 'bleed',
  'changed', 'fester', 'flaking', 'peeling',
  'rough texture', 'smooth texture', 'shiny surface',
  'redness', 'swelling', 'warmth', 'tenderness',
  'dark spot', 'light spot', 'multicolored',
  'flat lesion', 'dome shaped', 'pedunculated',
  'hard', 'soft', 'firm',
  'dry', 'moist', 'waxy',
  'sun damage', 'previous skin cancer',
  'appeared suddenly', 'slow growing', 'fast growing',
  'border irregular', 'border regular',
  'single lesion', 'multiple lesions',
  'skin colored', 'brown', 'black', 'red', 'pink', 'blue', 'white',
  'face', 'scalp', 'neck', 'trunk', 'arm', 'leg', 'hand', 'foot',
  'back', 'chest', 'abdomen', 'shoulder',
]

function TriageCard({ isAuthed = false, onRequireAuth }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [isExplaining, setIsExplaining] = useState(false)

  // ---- file helpers ----
  const handleFilePicked = (f) => {
    if (!f) return
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only JPG / PNG accepted'); return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Max 10 MB'); return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFilePicked(e.dataTransfer.files?.[0])
  }

  const handleBrowse = () => inputRef.current?.click()

  // ---- autocomplete ----
  const handleSymptomChange = (val) => {
    setSymptoms(val)
    const parts = val.split(',')
    const current = parts[parts.length - 1].trim().toLowerCase()
    if (current.length < 1) { setSuggestions([]); return }
    const already = parts.slice(0, -1).map(p => p.trim().toLowerCase())
    const filtered = PAD_SYMPTOMS.filter(
      s => s.toLowerCase().startsWith(current) && !already.includes(s.toLowerCase())
    )
    // fallback: if no startsWith match, try includes
    const results = filtered.length > 0
      ? filtered
      : PAD_SYMPTOMS.filter(
          s => s.toLowerCase().includes(current) && !already.includes(s.toLowerCase())
        )
    setSuggestions(results.slice(0, 8))
  }

  const pickSuggestion = (s) => {
    const parts = symptoms.split(',').map(p => p.trim()).filter(Boolean)
    parts[parts.length - 1] = s
    setSymptoms(parts.join(', ') + ', ')
    setSuggestions([])
  }

  // ---- submit ----
  const handleSubmit = async () => {
    if (!isAuthed) {
      setError('Please sign in to start triage')
      if (onRequireAuth) onRequireAuth()
      return
    }
    if (!file) { setError('Upload an image first'); return }
    setError('')
    setIsSubmitting(true)
    setResult(null)
    setExplanation('')

    const fd = new FormData()
    fd.append('image', file)
    fd.append('symptoms', symptoms)

    try {
      const res = await fetch(`${API}/predict`, { method: 'POST', body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || res.statusText)
      }
      const data = await res.json()
      setResult(data)

      // Auto-fetch AI explanation
      setIsExplaining(true)
      try {
        const explainRes = await fetch(`${API}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, user_symptoms: symptoms }),
        })
        if (explainRes.ok) {
          const explainData = await explainRes.json()
          setExplanation(explainData.explanation)
        }
      } catch (_) {
        // explanation is optional — don't block the report
      } finally {
        setIsExplaining(false)
      }

    } catch (err) {
      setError(err.message || 'Prediction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---- risk colour ----
  const riskColour = (level) => ['#22c55e', '#eab308', '#ef4444'][level] || '#888'

  return (
    <section className="triage" id="triage">
      <header className="triage__header">
        <p className="triage__eyebrow">Quick Triage</p>
        <h2 className="triage__heading">Skin Lesion Triage</h2>
        <p className="triage__subheading">
          Upload a photo of your skin lesion. Our EfficientNet-B2 model, fine-tuned on
          clinical dermatology data, will assess the risk level and provide
          recommendations — enhanced by AI-powered explanations.
        </p>
        <p className="triage__lead">Share a well‑lit image and a short description for early guidance.</p>
      </header>

      <div className="triage__panel">
        {/* ---- left: upload ---- */}
        <div className="triage__upload">
          <div
            className={`triage__drop ${isDragging ? 'triage__drop--active' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {preview
              ? <img src={preview} alt="preview" className="triage__preview" />
              : <>
                  <p className="triage__drop-title">{isDragging ? 'Release to upload' : 'Drop image here'}</p>
                  <p className="triage__drop-text">JPG or PNG, max 10 MB</p>
                </>
            }
          </div>
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')}
            onChange={e => handleFilePicked(e.target.files?.[0])} style={{ display: 'none' }} />
          <button className="triage__ghost" type="button" onClick={handleBrowse}>Browse files</button>
        </div>

        {/* ---- right: symptoms + submit ---- */}
        <div className="triage__form">
          <label className="triage__label" htmlFor="symptoms">Symptoms (comma‑separated)</label>
          <div className="triage__ac-wrap">
            <input
              id="symptoms"
              className="triage__input triage__input--wide"
              placeholder="e.g. itching, bleeding, growing..."
              value={symptoms}
              onChange={e => handleSymptomChange(e.target.value)}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="triage__suggestions">
                {suggestions.map(s => (
                  <li key={s} onMouseDown={() => pickSuggestion(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="triage__error">{error}</p>}

          <div className="triage__actions">
            <button className="triage__primary" type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Analysing…' : 'Start Triage'}
            </button>
          </div>
          <p className="triage__disclaimer">For guidance only. Not a medical diagnosis.</p>
        </div>
      </div>

      {/* ---- report ---- */}
      {result && (
        <div className="triage__report-wrapper">
          {/* LEFT: Risk Report */}
          <div className="triage__report" style={{ borderColor: riskColour(result.risk_level) }}>
            <h3 className="triage__report-title" style={{ color: riskColour(result.risk_level) }}>
              {result.prediction}
            </h3>
            <p className="triage__report-conf">Confidence: {result.confidence}%</p>

            <div className="triage__report-bars">
              {Object.entries(result.scores).map(([k, v]) => (
                <div key={k} className="triage__bar-row">
                  <span className="triage__bar-label">{k.replace('_', ' ')}</span>
                  <div className="triage__bar-track">
                    <div className="triage__bar-fill" style={{ width: `${v}%` }} />
                  </div>
                  <span className="triage__bar-pct">{v}%</span>
                </div>
              ))}
            </div>

            <div className="triage__report-rec">
              <h4>{result.recommendation.action}</h4>
              <p className="triage__report-urgency">{result.recommendation.urgency}</p>
              <ul>
                {result.recommendation.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>

            {result.symptoms_used.danger_flags > 0 && (
              <p className="triage__report-flags">
                ⚠️ {result.symptoms_used.danger_flags} danger symptom(s) detected — risk adjusted upward.
              </p>
            )}
          </div>

          {/* RIGHT: AI Explanation */}
          <div className="triage__explanation">
            <h4 className="triage__explanation-title">🤖 AI Explanation</h4>
            {isExplaining ? (
              <p className="triage__explanation-loading">Generating explanation…</p>
            ) : explanation ? (
              <div className="triage__explanation-text">{explanation}</div>
            ) : (
              <p className="triage__explanation-loading">Explanation unavailable</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default TriageCard
