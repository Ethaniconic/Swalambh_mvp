import ModelStats from '../components/ModelStats'
import './Features.css'

function Features() {
  return (
    <section className="features" id="features">
      <header className="features__header">
        <p className="features__eyebrow">EfficientNet-B0 + DermSight</p>
        <h1>Focused features for early skin triage.</h1>
        <p className="features__lead">
          Pre-trained on HAM10000 and fine-tuned on PAD-UFES-20, the model
          supports practical, explainable triage signals without overreach.
        </p>
      </header>

      <div className="features__grid">
        <article className="features__card">
          <h3>Lesion-aware image screening</h3>
          <p>
            Single-image analysis highlights likely lesion categories seen in
            HAM10000 to guide the first clinical question.
          </p>
        </article>
        <article className="features__card">
          <h3>Fine-tuned clinical context</h3>
          <p>
            PAD-UFES-20 tuning brings realistic primary care skin cases into the
            model, improving everyday triage relevance.
          </p>
        </article>
        <article className="features__card">
          <h3>Confidence-driven risk flags</h3>
          <p>
            Outputs include confidence bands and highlight when uncertainty is
            high, prompting a human review.
          </p>
        </article>
        <article className="features__card">
          <h3>Explainability overlays</h3>
          <p>
            Saliency-style heatmaps show which regions influenced predictions,
            supporting clinician trust.
          </p>
        </article>
        <article className="features__card">
          <h3>Image quality checks</h3>
          <p>
            Detects blur, poor lighting, or occlusions and requests a retake
            before generating insights.
          </p>
        </article>
        <article className="features__card">
          <h3>Structured triage summary</h3>
          <p>
            Produces a concise summary with top findings, recommended urgency,
            and next-step guidance.
          </p>
        </article>
      </div>
      <ModelStats />
    </section>
  )
}

export default Features
