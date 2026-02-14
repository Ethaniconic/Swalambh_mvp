import { use, useRef, useState } from 'react'
import './TriageCard.css'

function TriageCard() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const MAX_BYTES = 10 * 1024 * 1024
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const uploadUrl = `${apiBase}/triage/upload`

  const validateFile = (picked) => {
    if (!picked) return 'Please select an image.'
    if (!ACCEPTED_TYPES.includes(picked.type)) return 'Only JPG or PNG files are allowed.'
    if (picked.size > MAX_BYTES) return 'File must be 10MB or less.'
    return ''
  }

  const handleFilePicked = (picked) => {
    const message = validateFile(picked)
    if (message) {
      setError(message)
      setFile(null)
      return
    }
    setError('')
    setFile(picked)
  }

  const handleBrowse = () => {
    inputRef.current?.click()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    handleFilePicked(dropped)
  }

  const handleSubmit = async () => {
    const message = validateFile(file)
    if (message) {
      setError(message)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('symptoms', symptoms.trim())

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Upload failed.')
      }

      // Optionally handle response data here
      await response.json().catch(() => null)
      setFile(null)
      setSymptoms('')
    } catch (err) {
      setError(err?.message || 'Upload failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div 
            className="triage__drop"
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label="Upload image"
          >
            <p className="triage__drop-title">
              {isDragging ? 'Release to upload' : 'Drop image here'}
            </p>
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
