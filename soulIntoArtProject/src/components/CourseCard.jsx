import { Link } from 'react-router-dom';
import Button from './Button';
import './CourseCard.css';

export default function CourseCard({
  course,
  showEnrollButton = false,
  onEnroll,
  isEnrolling = false,
  compact = false,
  enrollmentDate = null,
  isEnrolled = false,
  subscriptionInfo = null
}) {
  // Generate placeholder image based on discipline
  const getPlaceholderImage = (discipline) => {
    const seed = encodeURIComponent(discipline || 'art');
    return `https://picsum.photos/seed/${seed}/400/250`;
  };

  // Generate instructor avatar
  const getInstructorAvatar = (email) => {
    const name = email ? email.split('@')[0] : 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A1F71&color=fff&size=40`;
  };

  // Format price with subscription check
  const getDisplayPrice = () => {
    // Si l'élève a un abonnement avec des cours gratuits disponibles
    if (subscriptionInfo && subscriptionInfo.has_free_courses && subscriptionInfo.type === 'artist_subscription') {
      return `Dans l'abonnement (${subscriptionInfo.courses_remaining} restant${subscriptionInfo.courses_remaining > 1 ? 's' : ''})`;
    }
    
    // Sinon afficher le prix normal
    if (!course.price_cents || course.price_cents === 0) return 'Gratuit';
    return `${(course.price_cents / 100).toFixed(2)} €`;
  };

  // Format price
  const formatPrice = (priceCents) => {
    if (!priceCents || priceCents === 0) return 'Gratuit';
    return `${(priceCents / 100).toFixed(2)} €`;
  };

  // Get level badge color
  const getLevelClass = (level) => {
    if (!level) return 'level-badge';
    const normalizedLevel = level.toLowerCase();
    if (normalizedLevel.includes('beginner') || normalizedLevel.includes('débutant')) {
      return 'level-badge level-beginner';
    }
    if (normalizedLevel.includes('intermediate') || normalizedLevel.includes('intermédiaire')) {
      return 'level-badge level-intermediate';
    }
    if (normalizedLevel.includes('advanced') || normalizedLevel.includes('avancé')) {
      return 'level-badge level-advanced';
    }
    return 'level-badge';
  };

  const imageUrl = course.image_url || getPlaceholderImage(course.discipline);
  const instructorAvatar = course.instructor_avatar || getInstructorAvatar(course.teacher?.email);
  const instructorName = course.instructor_name || course.teacher?.email?.split('@')[0] || 'Instructeur';
  const ratingAvg =
    course.rating_avg === null || course.rating_avg === undefined ? null : Number(course.rating_avg);
  const reviewsCount = Number(course.reviews_count || 0);
  const toRouteSlug = (value) =>
    (value || 'general')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'general';
  const disciplineSlug = toRouteSlug(course.discipline);
  const coursePath = `/tous-les-cours/${disciplineSlug}/${course.slug}`;

  const formatStars = (value) => {
    if (value === null || value === undefined) return '';
    const rounded = Math.max(0, Math.min(5, Math.round(Number(value))));
    return '\u2605'.repeat(rounded) + '\u2606'.repeat(5 - rounded);
  };

  return (
    <div className={`course-card ${compact ? 'course-card-compact' : ''}`}>
      <Link to={coursePath} className="course-card-link">
        {/* Course Image */}
        <div className="course-card-image">
          <img src={imageUrl} alt={course.title} />

          {/* Level Badge */}
          {course.level && (
            <div className={getLevelClass(course.level)}>
              {course.level}
            </div>
          )}

          {/* Price Badge */}
          <div className={`price-badge ${subscriptionInfo && subscriptionInfo.has_free_courses ? 'price-badge-subscription' : ''}`}>
            {getDisplayPrice()}
          </div>
        </div>

        {/* Course Content */}
        <div className="course-card-content">
          {/* Instructor */}
          <div className="course-instructor">
            <img
              src={instructorAvatar}
              alt={instructorName}
              className="instructor-avatar"
            />
            <span className="instructor-name">{instructorName}</span>
          </div>

          {/* Title */}
          <h3 className="course-title">{course.title}</h3>

          {/* Course Date or Cancelled Status */}
          {course.status === 'cancelled' ? (
            <div className="course-date course-cancelled">
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>ANNULÉ</span>
            </div>
          ) : course.course_date && (
            <div className="course-date">
              <span>📅 {new Date(course.course_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          )}

          {/* Discipline/Category Tags */}
          {course.discipline && (
            <div className="course-tags">
              <span className="course-tag">{course.discipline}</span>
              {course.format && (
                <span className="course-tag">{course.format}</span>
              )}
            </div>
          )}

          {/* Rating */}
          {reviewsCount > 0 && ratingAvg !== null && (
            <div className="course-rating">
              <span className="stars">{formatStars(ratingAvg)}</span>
              <span className="rating-value">
                ({ratingAvg.toFixed(1)} · {reviewsCount})
              </span>
            </div>
          )}

          {/* Enrollment Progress */}
          {course.max_students && (
            <div className="course-enrollment-progress">
              <div className="progress-label">
                <span>{course.enrolled_count || 0} / {course.max_students} inscrits</span>
                <span>{Math.round(((course.enrolled_count || 0) / course.max_students) * 100)}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, ((course.enrolled_count || 0) / course.max_students) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Enrollment Date (for My Courses) */}
          {enrollmentDate && (
            <p className="enrollment-date">
              Inscrit le {new Date(enrollmentDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </Link>

      {/* Action Button */}
      {showEnrollButton && (
        <div className="course-card-footer">
          <Button
            variant="secondary"
            size="medium"
            fullWidth
            onClick={() => onEnroll(course.id)}
            disabled={isEnrolling}
          >
            {isEnrolling ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </div>
      )}

      {isEnrolled && !enrollmentDate && (
        <div className="course-card-footer">
          <Button
            variant="primary"
            size="medium"
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
        </div>
      )}

      {enrollmentDate && (
        <div className="course-card-footer">
          <Link to={coursePath} className="course-card-continue-link">
            <Button variant="primary" size="medium" fullWidth>
              Continuer le cours
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
