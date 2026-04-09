import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import CourseCard from '../components/CourseCard';
import Toast from '../components/Toast';
import './CourseDetail.css';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const formatReviewError = (err, fallbackMessage) => {
    const code = (err?.message || '').toString();
    if (!code) return fallbackMessage;
    if (code === 'unauthorized') return 'Connectez-vous pour laisser un avis.';
    if (code === 'not_enrolled') return 'Vous devez etre inscrit au cours pour laisser un avis.';
    if (code === 'invalid_rating') return 'Merci de choisir une note entre 1 et 5.';
    if (code === 'invalid_comment') return 'Commentaire trop long (max 2000 caracteres).';
    if (code === 'course_not_found') return 'Cours introuvable.';
    if (code === 'not_found')
      return "Route API introuvable pour les avis. Redemarrez l'API et verifiez VITE_API_URL.";
    return fallbackMessage;
  };

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const foundCourse = await api.getCourse(slug);

        if (!foundCourse) {
          setError('Cours introuvable');
          setLoading(false);
          return;
        }

        setCourse(foundCourse);
        setIsEnrolled(foundCourse.is_enrolled);

        // Get related courses (same discipline)
        try {
          const allCourses = await api.listCourses();
          const related = allCourses
            .filter(c => c.discipline === foundCourse.discipline && c.id !== foundCourse.id)
            .slice(0, 3);
          setRelatedCourses(related);
        } catch (relErr) {
          console.error('Error loading related courses:', relErr);
        }

        // Si l'utilisateur est déjà inscrit, on charge son avis
        if (foundCourse.is_enrolled) {
          setReviewLoading(true);
          setReviewError('');
          try {
            const { review } = await api.getMyCourseReview(foundCourse.id);
            if (review) {
              setReviewForm({
                rating: Number(review.rating || 0),
                comment: review.comment || '',
              });
            } else {
              setReviewForm({ rating: 0, comment: '' });
            }
          } catch (reviewErr) {
            setReviewError(
              formatReviewError(reviewErr, reviewErr.message || 'Impossible de charger votre avis')
            );
          } finally {
            setReviewLoading(false);
          }
        }
      } catch (err) {
        setError(err.message || 'Impossible de charger le cours');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [slug, token]);

  

  const ratingAvg =
    course?.rating_avg === null || course?.rating_avg === undefined ? null : Number(course.rating_avg);
  const reviewsCount = Number(course?.reviews_count || 0);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!course) return;
    if (!token || !isEnrolled) return;

    setReviewSaving(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const result = await api.upsertMyCourseReview(course.id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      const summary = result?.summary || {};
      setCourse((current) =>
        current
          ? { ...current, rating_avg: summary.rating_avg, reviews_count: summary.reviews_count }
          : current
      );
      setReviewSuccess('Merci ! Votre avis a ete enregistre.');
      setTimeout(() => setReviewSuccess(''), 2500);
    } catch (err) {
      setReviewError(formatReviewError(err, err.message || "Impossible d'enregistrer votre avis"));
    } finally {
      setReviewSaving(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      navigate('/dashboard');
      return;
    }

    setEnrolling(true);
    setToast({ message: '', type: 'success' });

    try {
      await api.enroll(course.id);
      setIsEnrolled(true);
      setToast({ message: 'Inscription réussie !', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Impossible de s\'inscrire', type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="loading-state">Chargement du cours...</div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>{error}</h2>
            <Link to="/tous-les-cours-en-ligne">
              <Button variant="primary">Retour au catalogue</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getInstructorAvatar = (email) => {
    const name = email ? email.split('@')[0] : 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A1F71&color=fff&size=80`;
  };

  const getCourseImage = (discipline) => {
    const seed = encodeURIComponent(discipline || 'art');
    return `https://picsum.photos/seed/${seed}/1200/500`;
  };

  const formatPrice = (priceCents) => {
    if (!priceCents || priceCents === 0) return 'Gratuit';
    return `${(priceCents / 100).toFixed(2)} €`;
  };

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })}
      />
      <div className="course-detail-page">
      {/* Hero Section */}
      <div className="course-hero" style={{ backgroundImage: `url(${getCourseImage(course.discipline)})` }}>
        <div className="course-hero-overlay" />
        <div className="container">
          <div className="course-hero-content">
            <div className="course-breadcrumb">
              <Link to="/tous-les-cours-en-ligne">Cours</Link>
              <span> / </span>
              <span>{course.discipline}</span>
            </div>
            <h1>{course.title}</h1>
            {course.status === 'cancelled' ? (
              <div className="course-date-detail course-cancelled-detail">
                <span style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '1.2rem' }}>ANNULÉ</span>
              </div>
            ) : course.course_date && (
              <div className="course-date-detail">
                📅 {new Date(course.course_date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
            <div className="course-meta">
              <span className="meta-item">{course.level}</span>
              <span className="meta-separator">•</span>
              <span className="meta-item">{course.format}</span>
              <span className="meta-separator">•</span>
              <span className="meta-item">{course.discipline}</span>
              {reviewsCount > 0 && ratingAvg !== null && (
                <>
                  <span className="meta-separator">•</span>
                  <span className="meta-item">
                    {ratingAvg.toFixed(1)}/5 ({reviewsCount} avis)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-detail-layout">
          {/* Main Content */}
          <div className="course-main-content">
            {/* Instructor */}
            <section className="course-section">
              <h2>Enseignant</h2>
              <div className="instructor-card">
                <img
                  src={getInstructorAvatar(course.teacher?.email)}
                  alt={course.teacher?.email}
                  className="instructor-avatar-large"
                />
                <div className="instructor-info">
                  <h3>{course.teacher?.email?.split('@')[0] || 'Instructeur'}</h3>
                  <p>Expert en {course.discipline}</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="course-section">
              <h2>À propos de ce cours</h2>
              <p className="course-description">{course.description}</p>
            </section>

            {/* Zoom Live Section */}
            {course.format === 'live' && (isEnrolled || user?.id === course.teacher_id) && (
              <section className="course-section zoom-live-section">
                <h2>Session en direct</h2>
                <div className="zoom-card">
                  <div className="zoom-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H7.5c-.28 0-.5-.22-.5-.5V10.5c0-.28.22-.5.5-.5h9c.28 0 .5.22.5.5v5c0 .28-.22.5-.5.5z"/>
                    </svg>
                  </div>
                  <div className="zoom-info">
                    <h3>Accéder à la réunion Zoom</h3>
                    {(!course.zoom_join_url && !course.zoom_start_url) ? (
                      <p className="zoom-error-text">
                        {user?.id === course.teacher_id 
                          ? "Attention : La réunion Zoom n'a pas pu être créée automatiquement. Vérifiez vos identifiants dans le Dashboard."
                          : "Le lien de la réunion n'est pas encore disponible. Contactez l'enseignant."}
                      </p>
                    ) : (
                      <p>
                        {user?.id === course.teacher_id 
                          ? "En tant qu'enseignant, utilisez le bouton ci-dessous pour démarrer la session."
                          : "Cliquez sur le bouton ci-dessous pour rejoindre le cours en direct."}
                      </p>
                    )}
                    {course.course_date && (
                      <p className="zoom-time">
                        Prévu le : {new Date(course.course_date).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="zoom-actions">
                    {user?.id === course.teacher_id ? (
                      <a 
                        href={course.zoom_start_url || '#'} 
                        target={course.zoom_start_url ? "_blank" : "_self"} 
                        rel="noopener noreferrer"
                        onClick={(e) => !course.zoom_start_url && e.preventDefault()}
                      >
                        <Button variant="primary" disabled={!course.zoom_start_url}>
                          {course.zoom_start_url ? "Démarrer la réunion" : "Lien indisponible"}
                        </Button>
                      </a>
                    ) : (
                      <a 
                        href={course.zoom_join_url || '#'} 
                        target={course.zoom_join_url ? "_blank" : "_self"} 
                        rel="noopener noreferrer"
                        onClick={(e) => !course.zoom_join_url && e.preventDefault()}
                      >
                        <Button variant="primary" disabled={!course.zoom_join_url}>
                          {course.zoom_join_url ? "Rejoindre le direct" : "Lien indisponible"}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* What You'll Learn */}
            <section className="course-section">
              <h2>Ce que vous apprendrez</h2>
              <ul className="learning-outcomes">
                <li>Techniques fondamentales de {course.discipline}</li>
                <li>Développement de votre style artistique personnel</li>
                <li>Exercices pratiques et projets créatifs</li>
                <li>Conseils et astuces de professionnels</li>
              </ul>
            </section>

            {/* Review */}
            <section className="course-section">
              <h2>Votre avis</h2>
              {!token ? (
                <p className="course-review-hint">
                  Connectez-vous puis inscrivez-vous au cours pour laisser un avis.
                </p>
              ) : !isEnrolled ? (
                <p className="course-review-hint">Inscrivez-vous pour laisser un avis.</p>
              ) : reviewLoading ? (
                <p className="course-review-hint">Chargement de votre avis...</p>
              ) : (
                <form className="course-review-box" onSubmit={handleReviewSubmit}>
                  <div className="review-stars" role="radiogroup" aria-label="Note du cours">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const filled = value <= (reviewForm.rating || 0);
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`review-star ${filled ? 'filled' : 'empty'}`}
                          onClick={() =>
                            setReviewForm((current) => ({ ...current, rating: value }))
                          }
                          aria-label={`${value} etoiles`}
                        >
                          {filled ? '\u2605' : '\u2606'}
                        </button>
                      );
                    })}
                  </div>

                  <label className="review-label">
                    Commentaire (optionnel)
                    <textarea
                      className="review-textarea"
                      value={reviewForm.comment}
                      maxLength={2000}
                      onChange={(event) =>
                        setReviewForm((current) => ({ ...current, comment: event.target.value }))
                      }
                      placeholder="Partagez votre experience..."
                    />
                  </label>

                  <div className="review-helper">
                    <span>{reviewForm.comment.length}/2000</span>
                    {reviewError && <span className="review-error">{reviewError}</span>}
                    {reviewSuccess && <span className="review-success">{reviewSuccess}</span>}
                  </div>

                  <Button
                    variant="primary"
                    size="medium"
                    type="submit"
                    disabled={reviewSaving || !reviewForm.rating}
                  >
                    {reviewSaving ? 'Enregistrement...' : 'Enregistrer mon avis'}
                  </Button>
                </form>
              )}
            </section>

            

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <section className="course-section">
                <h2>Cours similaires</h2>
                <div className="related-courses-grid">
                  {relatedCourses.map(relatedCourse => (
                    <CourseCard key={relatedCourse.id} course={relatedCourse} compact />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="course-sidebar">
            <div className="course-sidebar-sticky">
              <div className="course-price-card">
                <div className="price-display">
                  <span className="price-amount">{formatPrice(course.price_cents)}</span>
                </div>

                <div className="course-rating-summary">
                  {reviewsCount > 0 && ratingAvg !== null ? (
                    <span>
                      Note moyenne: {ratingAvg.toFixed(1)}/5 ({reviewsCount} avis)
                    </span>
                  ) : (
                    <span>Aucun avis pour le moment</span>
                  )}
                </div>


                {course.status === 'cancelled' ? (
                  <div className="cancelled-badge" style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    Cours annulé
                  </div>
                ) : isEnrolled ? (
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    disabled
                    style={{
                      backgroundColor: '#28a745',
                      borderColor: '#28a745',
                      cursor: 'default',
                      opacity: 1
                    }}
                  >
                    ✓ Inscrit
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Inscription...' : 'S\'inscrire au cours'}
                  </Button>
                )}

                <div className="course-info-list">
                  <div className="info-item">
                    <span className="info-label">Niveau</span>
                    <span className="info-value">{course.level}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Discipline</span>
                    <span className="info-value">{course.discipline}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Format</span>
                    <span className="info-value">{course.format}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
