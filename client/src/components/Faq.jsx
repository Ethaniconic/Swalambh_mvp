import { useState } from 'react'
import './Faq.css'

const defaultItems = [
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. DermSight provides guidance and highlights risk signals, but a clinician should make the final decision.',
  },
  {
    question: 'What images work best?',
    answer:
      'Use a well-lit, in-focus photo that clearly shows the skin area without heavy shadows or filters.',
  },
  {
    question: 'How is patient data handled?',
    answer:
      'Uploads can be reviewed and removed. We recommend storing only what is necessary for care.',
  },
]

// Update or add an FAQ entry about the model
const faqs = [
  // ...existing faqs...
  {
    question: "What AI model does DermSight use?",
    answer:
      "DermSight uses EfficientNet-B2, a state-of-the-art convolutional neural network. " +
      "We initially trained with EfficientNet-B0 but upgraded to B2 for significantly " +
      "better accuracy. The model is fine-tuned on the PAD-UFES clinical dermatology " +
      "dataset and classifies lesions into three risk tiers: Low, Medium, and High."
  },
  {
    question: "Why did you switch from B0 to B2?",
    answer:
      "EfficientNet-B0 gave us a solid starting point, but it struggled with edge cases — " +
      "particularly distinguishing medium-risk from high-risk lesions. EfficientNet-B2 has " +
      "a deeper architecture (9.1M parameters vs 5.3M) which captures finer details in " +
      "skin images, resulting in a significant improvement in accuracy across all categories."
  },
  // ...existing faqs...
]

function Faq({ title = 'Questions, answered', lead, items = defaultItems }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq" id="faq">
      <header className="faq__header">
        <p className="faq__eyebrow">FAQ</p>
        <h2>{title}</h2>
        {lead && <p className="faq__lead">{lead}</p>}
      </header>

      <div className="faq__list">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <article className="faq__item" key={item.question}>
              <button
                className="faq__question"
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenIndex((prev) => (prev === index ? -1 : index))
                }
              >
                <span>{item.question}</span>
                <span className="faq__icon">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <p className="faq__answer">{item.answer}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Faq
