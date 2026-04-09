import { useEffect, useRef } from 'react';
import './TestimonialCarousel.css';

export default function TestimonialCarousel({ testimonials }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollAmount += scrollSpeed;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }
      scrollContainer.scrollLeft = scrollAmount;
    };

    const intervalId = setInterval(scroll, 20);

    return () => clearInterval(intervalId);
  }, []);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="testimonial-carousel">
      <div className="testimonial-track" ref={scrollRef}>
        {duplicatedTestimonials.map((testimonial, index) => (
          <div key={`${testimonial.id}-${index}`} className="testimonial-card">
            <div className="testimonial-rating">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < testimonial.rating ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
            </div>
            <p className="testimonial-quote">"{testimonial.quote}"</p>
            <div className="testimonial-author">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="testimonial-avatar"
              />
              <div className="testimonial-info">
                <p className="testimonial-name">{testimonial.name}</p>
                <p className="testimonial-technique">{testimonial.technique}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
