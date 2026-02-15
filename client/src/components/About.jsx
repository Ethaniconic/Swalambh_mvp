import React from 'react';
import { Section } from 'react-scroll';
import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    <Section id="about">
      <h2>About Our Model</h2>
      <p>
        DermSight started with EfficientNet-B0, which showed promising results but
        had limitations in distinguishing between medium and high-risk lesions. We
        upgraded to <strong>EfficientNet-B2</strong>, a deeper and more capable
        architecture, and fine-tuned it on the PAD-UFES clinical dataset.
      </p>
      <p>
        The result? A significant leap in accuracy — the B2 model delivers more
        reliable classifications across all three risk categories, giving users
        greater confidence in their triage results.
      </p>

      <div className="about__model-highlights">
        <div className="about__highlight-card">
          <span className="about__highlight-icon">🧠</span>
          <h3>EfficientNet-B2</h3>
          <p>Deeper architecture with 9.1M parameters for superior feature extraction</p>
        </div>
        <div className="about__highlight-card">
          <span className="about__highlight-icon">📊</span>
          <h3>Higher Accuracy</h3>
          <p>Upgraded from B0 — significantly improved precision and recall across all risk levels</p>
        </div>
        <div className="about__highlight-card">
          <span className="about__highlight-icon">🏥</span>
          <h3>PAD-UFES Dataset</h3>
          <p>Fine-tuned on real clinical dermatology images for reliable, real-world performance</p>
        </div>
        <div className="about__highlight-card">
          <span className="about__highlight-icon">🔬</span>
          <h3>3-Tier Triage</h3>
          <p>Low, Medium, and High risk classification with symptom-adjusted scoring</p>
        </div>
      </div>
    </Section>
  );
};

export default AboutSection;