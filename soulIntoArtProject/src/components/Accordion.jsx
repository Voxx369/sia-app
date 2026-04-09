import { useState } from 'react';
import './Accordion.css';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={item.id} className="accordion-item">
          <button
            className={`accordion-header ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
          >
            <span className="accordion-dot"></span>
            <span className="accordion-question">{item.question}</span>
            <span className="accordion-icon">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
            <div className="accordion-answer">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
