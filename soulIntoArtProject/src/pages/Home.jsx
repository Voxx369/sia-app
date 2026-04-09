import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import CourseCard from '../components/CourseCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import { api } from '../api/client';
import { useSiteContent } from '../hooks/useSiteContent';
import './Home.css';

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const { content: siteContent } = useSiteContent([
    'home.hero_slides',
    'home.testimonials',
    'home.faqs',
  ]);

  const heroSlides = siteContent['home.hero_slides'] || [];
  const testimonials = siteContent['home.testimonials'] || [];
  const faqs = siteContent['home.faqs'] || [];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await api.listCourses();
        setFeaturedCourses(data.slice(0, 6));
      } catch (error) {
        console.error('Erreur de chargement des cours:', error);
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterMessage('Merci de votre inscription !');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterMessage(''), 3000);
  };

  const toRouteSlug = (value) =>
    (value || 'general')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'general';

  const featuredCourse = featuredCourses[0];
  const featuredDisciplineSlug = toRouteSlug(featuredCourse?.discipline);
  const featuredRoute = featuredCourse
    ? `/tous-les-cours/${featuredDisciplineSlug}/${featuredCourse.slug}`
    : '/tous-les-cours-en-ligne';

  const getFeaturedImage = (course) => {
    const seed = encodeURIComponent(course?.discipline || 'art');
    return course?.image_url || `https://picsum.photos/seed/${seed}/960/560`;
  };

  const getFeaturedInstructorName = (course) =>
    course?.instructor_name || course?.teacher?.email?.split('@')[0] || 'Artiste SIA';

  const getFeaturedInstructorAvatar = (course) => {
    const name = getFeaturedInstructorName(course);
    return (
      course?.instructor_avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A1F71&color=fff&size=80`
    );
  };

  const formatFeaturedPrice = (priceCents) => {
    if (!priceCents || priceCents === 0) return 'Gratuit';
    return `${(priceCents / 100).toFixed(2).replace('.', ',')} EUR`;
  };

  return (
    <div className="home-page">
      <HeroSlider slides={heroSlides} />

      {!coursesLoading && featuredCourse && (
        <section className="section featured-spotlight-section">
          <div className="container">
            <div className="featured-spotlight-box">
              <div className="featured-spotlight-header">
                <span className="featured-spotlight-badge">A NE PAS MANQUER</span>
                <h2>Cours a la Une</h2>
              </div>

              <article className="featured-spotlight-card">
                <div className="featured-spotlight-image-wrap">
                  <img src={getFeaturedImage(featuredCourse)} alt={featuredCourse.title} />
                  <span className="featured-spotlight-format-pill">
                    {featuredCourse.format === 'live' ? 'COURS EN DIRECT' : 'COURS A LA DEMANDE'}
                  </span>
                </div>

                <div className="featured-spotlight-content">
                  <div className="featured-spotlight-tags">
                    {featuredCourse.discipline && <span>{featuredCourse.discipline}</span>}
                    {featuredCourse.format && <span>{featuredCourse.format}</span>}
                  </div>

                  <h3>{featuredCourse.title}</h3>

                  <div className="featured-spotlight-instructor">
                    <img
                      src={getFeaturedInstructorAvatar(featuredCourse)}
                      alt={getFeaturedInstructorName(featuredCourse)}
                    />
                    <span>{getFeaturedInstructorName(featuredCourse)}</span>
                  </div>

                  {featuredCourse.description && (
                    <p className="featured-spotlight-description">
                      {featuredCourse.description.slice(0, 170)}
                      {featuredCourse.description.length > 170 ? '...' : ''}
                    </p>
                  )}

                  <div className="featured-spotlight-footer">
                    <span className="featured-spotlight-price">
                      {formatFeaturedPrice(featuredCourse.price_cents)}
                    </span>
                    <Link to={featuredRoute}>
                      <Button variant="secondary" size="medium">
                        Decouvrir le cours
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>

              <div className="featured-spotlight-controls" aria-hidden="true">
                <button type="button" className="spotlight-control-btn">‹</button>
                <button type="button" className="spotlight-control-btn active">›</button>
              </div>

              <div className="featured-spotlight-dots" aria-hidden="true">
                <span className="active"></span>
                <span></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {!coursesLoading && featuredCourses.length > 1 && (
        <section className="section courses-preview-section">
          <div className="container">
            <div className="section-header">
              <h2>Cours populaires</h2>
              <p className="section-subtitle">
                Explorez notre selection de cours pour tous les niveaux
              </p>
            </div>
            <div className="courses-grid">
              {featuredCourses.slice(1, 7).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="section-cta">
              <Link to="/tous-les-cours-en-ligne">
                <Button variant="secondary" size="large">
                  Voir tous les cours
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section testimonials-section">
          <div className="container-wide">
            <div className="section-header">
              <h2>Ce que disent nos eleves</h2>
              <p className="section-subtitle">
                Rejoignez des milliers d'artistes qui ont transforme leur creativite
              </p>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section faq-section">
          <div className="container">
            <div className="section-header">
              <h2>Questions frequentes</h2>
              <p className="section-subtitle">
                Tout ce que vous devez savoir sur nos cours en ligne
              </p>
            </div>
            <Accordion items={faqs} />
          </div>
        </section>
      )}

      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-box">
            <h2>Restez inspire</h2>
            <p>
              Inscrivez-vous a notre newsletter pour recevoir nos derniers cours et conseils artistiques
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Votre email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <Button type="submit" variant="primary" size="medium">
                S'inscrire
              </Button>
            </form>
            {newsletterMessage && <p className="newsletter-message">{newsletterMessage}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
