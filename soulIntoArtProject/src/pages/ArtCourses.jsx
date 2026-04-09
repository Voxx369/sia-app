import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FilterSidebar from "../components/FilterSidebar";
import CourseCard from "../components/CourseCard";
import Toast from "../components/Toast";
import "./ArtCourses.css";

export default function ArtCourses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState({}); // { teacherId: subscriptionInfo }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    formats: [],
    disciplines: [],
    levels: []
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listCourses();
        setCourses(data);
        setFilteredCourses(data);
        
        // Charger les cours inscrits si connecté
        if (token) {
          try {
            const enrolled = await api.myCourses();
            setEnrolledCourseIds(enrolled.map(c => c.id));
            
            // Charger les informations d'abonnement pour chaque professeur unique
            const teacherIds = [...new Set(data.map(c => c.teacher_id).filter(Boolean))];
            const subInfo = {};
            
            await Promise.all(teacherIds.map(async (teacherId) => {
              try {
                const info = await api.getSubscriptionInfo(teacherId);
                if (info) {
                  subInfo[teacherId] = info;
                }
              } catch (err) {
                // Pas d'abonnement pour ce prof, c'est normal
                console.log(`Pas d'abonnement pour le prof ${teacherId}`);
              }
            }));
            
            setSubscriptionInfo(subInfo);
          } catch (err) {
            console.error('Erreur chargement cours inscrits:', err);
          }
        }
      } catch (err) {
        setError(err.message || "Impossible de charger les cours");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // Apply filters whenever filters change
  useEffect(() => {
    let result = [...courses];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(course =>
        course.title?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.discipline?.toLowerCase().includes(searchLower)
      );
    }

    // Format filter
    if (filters.formats.length > 0) {
      result = result.filter(course =>
        filters.formats.some(format =>
          course.format?.toLowerCase().includes(format)
        )
      );
    }

    // Discipline filter
    if (filters.disciplines.length > 0) {
      result = result.filter(course =>
        filters.disciplines.some(discipline =>
          course.discipline?.toLowerCase().includes(discipline)
        )
      );
    }

    // Level filter
    if (filters.levels.length > 0) {
      result = result.filter(course => {
        const courseLevel = course.level?.toLowerCase();
        return filters.levels.some(level => {
          if (level === 'beginner') return courseLevel?.includes('debutant') || courseLevel?.includes('beginner');
          if (level === 'intermediate') return courseLevel?.includes('intermediaire') || courseLevel?.includes('intermediate');
          if (level === 'advanced') return courseLevel?.includes('avance') || courseLevel?.includes('advanced');
          return false;
        });
      });
    }

    setFilteredCourses(result);
  }, [filters, courses]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEnroll = async (courseId) => {
    if (!token) {
      navigate("/dashboard");
      return;
    }
    setEnrolling(courseId);
    setToast({ message: '', type: 'success' });
    try {
      await api.enroll(courseId);
      setEnrolledCourseIds(prev => [...prev, courseId]);
      setToast({ message: "Inscription réussie !", type: 'success' });
      
      // Trouver le cours pour afficher la proposition d'abonnement
      const course = courses.find(c => c.id === courseId);
      if (course && course.teacher_id) {
        setEnrolledCourse(course);
        setShowSubscriptionModal(true);
      }
    } catch (err) {
      setToast({ message: err.message || "Impossible de s'inscrire", type: 'error' });
    } finally {
      setEnrolling(null);
    }
  };

  const handleSubscribeToTeacher = () => {
    if (enrolledCourse && enrolledCourse.teacher_id) {
      navigate(`/offre-abonnements?teacher=${enrolledCourse.teacher_id}`);
    }
  };

  const handleCloseModal = () => {
    setShowSubscriptionModal(false);
    setEnrolledCourse(null);
  };

  if (loading) {
    return (
      <div className="courses-page">
        <div className="container">
          <div className="loading-state">Chargement des cours...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })}
      />
      
      {/* Modal de proposition d'abonnement */}
      {showSubscriptionModal && enrolledCourse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content subscription-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>
            <div className="modal-icon">🎨</div>
            <h2>Vous êtes inscrit !</h2>
            <p className="modal-subtitle">
              Profitez encore plus des cours de{' '}
              <strong>{enrolledCourse.instructor_name || enrolledCourse.teacher?.email?.split('@')[0] || 'ce professeur'}</strong>
            </p>
            <div className="modal-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Accès à tous les cours en direct</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Replays illimités</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Contenu exclusif</span>
              </div>
            </div>
            <p className="modal-offer">
              Abonnez-vous dès maintenant à partir de <strong>10€/mois</strong>
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleSubscribeToTeacher}>
                Voir les abonnements
              </button>
              <button className="btn-secondary" onClick={handleCloseModal}>
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="courses-page">
        <div className="courses-header">
        <div className="container">
          <h1>Catalogue des cours</h1>
          <p className="courses-subtitle">
            Explorez notre collection de cours d'art en ligne
          </p>
        </div>
      </div>

      <div className="container">
        {/* Messages */}
        {!token && (
          <div className="info-message">
            Connectez-vous pour vous inscrire aux cours
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        {/* Main Content */}
        <div className="courses-layout">
          {/* Sidebar */}
          <FilterSidebar onFilterChange={handleFilterChange} initialFilters={filters} />

          {/* Course Grid */}
          <div className="courses-content">
            {filteredCourses.length === 0 ? (
              <div className="empty-state">
                <h3>Aucun cours trouvé</h3>
                <p>Essayez de modifier vos filtres pour voir plus de résultats.</p>
              </div>
            ) : (
              <>
                <div className="courses-count">
                  {filteredCourses.length} cours {filteredCourses.length > 1 ? 'trouvés' : 'trouvé'}
                </div>
                <div className="courses-grid">
                  {filteredCourses.map((course) => {
                    const isEnrolled = enrolledCourseIds.includes(course.id);
                    const teacherSubscription = course.teacher_id ? subscriptionInfo[course.teacher_id] : null;
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        showEnrollButton={!!token && !isEnrolled}
                        isEnrolled={isEnrolled}
                        onEnroll={handleEnroll}
                        isEnrolling={enrolling === course.id}
                        subscriptionInfo={teacherSubscription}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
