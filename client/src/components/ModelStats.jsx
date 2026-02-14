import './ModelStats.css'

function ModelStats() {
  return (
    <section className="model" id="model">
      <header className="model__header">
        <p className="model__eyebrow">Model Focus</p>
        <h2>EfficientNet-B0 tuned for dermoscopic triage.</h2>
        <p className="model__lead">
          Pre-training on HAM10000 and fine-tuning on PAD-UFES-20 keeps the model
          grounded in clinical skin imagery without overreach.
        </p>
      </header>

      <div className="model__badges">
        <span className="model__badge">HAM10000 pre-training</span>
        <span className="model__badge">PAD-UFES-20 fine-tuning</span>
        <span className="model__badge">EfficientNet-B0 backbone</span>
      </div>

      <div className="model__grid">
        <article className="model__card">
          <h3>Input handling</h3>
          <p>Standardized 224x224 crops with quality checks.</p>
        </article>
        <article className="model__card">
          <h3>Outputs</h3>
          <p>Top-ranked lesion category suggestions with confidence bands.</p>
        </article>
        <article className="model__card">
          <h3>Explainability</h3>
          <p>Heatmap overlays to show regions that influence predictions.</p>
        </article>
        <article className="model__card">
          <h3>Safety focus</h3>
          <p>Escalation flags when uncertainty or risk is high.</p>
        </article>
      </div>
    </section>
  )
}

export default ModelStats
