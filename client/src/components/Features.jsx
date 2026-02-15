import React, { useState } from 'react'
import './Features.css'

const FEATURES = [
  {
    id: 'model',
    icon: '🧠',
    title: 'EfficientNet-B2 Engine',
    short: 'Deep learning model with 9.1M parameters for precise skin analysis.',
    detail: [
      'Upgraded from EfficientNet-B0 after it struggled with medium vs high-risk edge cases.',
      'EfficientNet-B2 uses compound scaling — balancing depth, width, and resolution — for superior feature extraction from skin images.',
      '9.1 million trainable parameters (vs 5.3M in B0) capture finer textures, colour gradients, and border irregularities.',
      'Input pipeline: Resize → 260×260, CenterCrop → 224×224, ImageNet normalisation.',
    ],
  },
  {
    id: 'dataset',
    icon: '🏥',
    title: 'PAD-UFES Clinical Dataset',
    short: 'Trained on real clinical dermatology images from Brazilian hospitals.',
    detail: [
      'PAD-UFES contains 2,298 clinical images of 6 skin lesion types (MEL, BCC, SCC, ACK, SEK, NEV).',
      'Each image has metadata: age, sex, lesion location, and clinical symptoms (itch, bleed, grew, elevation).',
      'Images captured with standard smartphone cameras — matching real-world usage conditions.',
      'Mapped to 3 risk tiers: High (MEL, SCC, SEK), Medium (BCC, ACK), Low (NEV + others).',
    ],
  },
  {
    id: 'accuracy',
    icon: '📊',
    title: 'High Accuracy & Reliability',
    short: 'Significant improvement over B0 with strong precision and recall.',
    detail: [
      'EfficientNet-B2 achieved substantially higher accuracy than the B0 baseline across all risk tiers.',
      'Test-Time Augmentation (TTA) using horizontal and vertical flips boosts prediction stability.',
      'Symptom-aware scoring adjusts probabilities when clinical danger flags (bleeding, growth) are present.',
      'Confidence threshold: any lesion with >30% high-risk probability is automatically escalated to High Risk.',
    ],
  },
  {
    id: 'triage',
    icon: '🚦',
    title: '3-Tier Risk Triage',
    short: 'Classifies lesions into Low, Medium, and High risk with clear next steps.',
    detail: [
      '🟢 Low Risk — Self-monitor at home, track changes monthly, re-check in 3 months.',
      '🟡 Medium Risk — Schedule a dermatology appointment within 2 weeks for evaluation.',
      '🔴 High Risk — Seek urgent medical attention within 48 hours; early detection saves lives.',
      'Each tier includes specific, actionable recommendations tailored to the risk level.',
    ],
  },
  {
    id: 'symptoms',
    icon: '📝',
    title: 'Symptom-Aware Analysis',
    short: 'Clinical symptoms like itching, bleeding, and growth adjust the risk score.',
    detail: [
      '4 key danger flags from PAD-UFES metadata: itching, bleeding, growing, elevation.',
      'When 2+ danger flags are present, high-risk probability is boosted by 15% per flag.',
      'Bleeding + growing together triggers an additional 25% high-risk escalation.',
      'Autocomplete suggests symptoms from the PAD-UFES vocabulary for consistency.',
    ],
  },
  {
    id: 'explain',
    icon: '🤖',
    title: 'AI-Powered Explanations',
    short: 'Groq LLaMA 3.3 70B generates plain-English explanations of every result.',
    detail: [
      'After classification, the triage report is sent to LLaMA 3.3 70B via Groq API.',
      'The AI explains what the risk level means, why it was assigned, and what to do next.',
      'Written in warm, reassuring language — no medical jargon, easy for anyone to understand.',
      'Includes a disclaimer that this is AI guidance, not a substitute for professional diagnosis.',
    ],
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: 'Privacy & Security',
    short: 'Your images are processed in real-time and never stored on our servers.',
    detail: [
      'Uploaded images are used only for the current prediction and discarded immediately after.',
      'No patient data is stored, logged, or shared with third parties.',
      'API keys are stored securely in environment variables — never hardcoded or exposed.',
      'All communication between frontend and backend uses secure HTTP protocols.',
    ],
  },
  {
    id: 'responsive',
    icon: '📱',
    title: 'Fully Responsive Design',
    short: 'Works seamlessly on desktop, tablet, and mobile devices.',
    detail: [
      'Risk report and AI explanation displayed side-by-side on desktop for quick comparison.',
      'Stacks vertically on mobile for comfortable reading without horizontal scrolling.',
      'Fast loading — model runs server-side so even low-powered devices get instant results.',
      'Clean, accessible UI with colour-coded risk indicators for quick visual triage.',
    ],
  },
]

export default function Features() {
  const [active, setActive] = useState(null)

  const toggle = (id) => setActive(active === id ? null : id)

  return (
    <section className="features" id="features">
      <div className="features__header">
        <h2 className="features__title">What Powers DermSight</h2>
        <p className="features__subtitle">
          From EfficientNet-B0 to B2 — every component is built for accuracy,
          clarity, and trust. Here's what's under the hood.
        </p>
      </div>

      {/* Stats banner */}
      <div className="features__stats">
        <div className="features__stat">
          <span className="features__stat-value">9.1M</span>
          <span className="features__stat-label">Parameters</span>
        </div>
        <div className="features__stat">
          <span className="features__stat-value">B0 → B2</span>
          <span className="features__stat-label">Architecture Upgrade</span>
        </div>
        <div className="features__stat">
          <span className="features__stat-value">3-Tier</span>
          <span className="features__stat-label">Risk Classification</span>
        </div>
        <div className="features__stat">
          <span className="features__stat-value">TTA</span>
          <span className="features__stat-label">Test-Time Augmentation</span>
        </div>
        <div className="features__stat">
          <span className="features__stat-value">70B</span>
          <span className="features__stat-label">LLaMA Explainer</span>
        </div>
      </div>

      {/* Feature cards */}
      <div className="features__grid">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            className={`features__card ${active === f.id ? 'features__card--open' : ''}`}
            onClick={() => toggle(f.id)}
          >
            <div className="features__card-header">
              <span className="features__card-icon">{f.icon}</span>
              <h3 className="features__card-title">{f.title}</h3>
            </div>
            <p className="features__card-short">{f.short}</p>

            {active === f.id && (
              <ul className="features__card-detail">
                {f.detail.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}

            <span className="features__card-toggle">
              {active === f.id ? '▲ Less' : '▼ More'}
            </span>
          </div>
        ))}
      </div>

      {/* Model journey */}
      <div className="features__journey">
        <h3 className="features__journey-title">Our Model Journey</h3>
        <div className="features__timeline">
          <div className="features__timeline-step">
            <div className="features__timeline-dot features__timeline-dot--past" />
            <div className="features__timeline-content">
              <h4>Phase 1 — EfficientNet-B0</h4>
              <p>
                Initial training on PAD-UFES. Achieved baseline accuracy but
                struggled with medium vs high-risk edge cases. Limited feature
                depth with 5.3M parameters.
              </p>
            </div>
          </div>
          <div className="features__timeline-step">
            <div className="features__timeline-dot features__timeline-dot--current" />
            <div className="features__timeline-content">
              <h4>Phase 2 — EfficientNet-B2 ✅</h4>
              <p>
                Upgraded to B2 with 9.1M parameters. Compound scaling improved
                feature extraction dramatically. Added TTA, symptom-aware
                scoring, and Groq-powered AI explanations. Significant accuracy
                improvement across all tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}