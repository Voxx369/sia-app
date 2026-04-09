import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";

export default function TeacherCourses() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [retryingZoom, setRetryingZoom] = useState(null);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.myTeacherCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || "Impossible de charger vos cours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== "teacher") return;
    loadCourses();
  }, [token, user?.role]);

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  const loadEnrollments = async (courseId) => {
    try {
      const data = await api.courseEnrollments(courseId);
      setSelected(courseId);
      setEnrollments(data);
    } catch (err) {
      setError(err.message || "Impossible de charger les inscrits");
    }
  };

  const handleCancelCourse = async (course) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler le cours "${course.title}" ? Cette action est irréversible et les élèves inscrits seront notifiés.`)) {
      return;
    }

    try {
      setCancelling(true);
      await api.cancelCourse(course.id);
      alert("Le cours a été annulé avec succès.");
      await loadCourses();
    } catch (err) {
      const msg = err.message || "Une erreur est survenue lors de l'annulation";
      alert(msg);
      setError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryZoom = async (courseId) => {
    try {
      setRetryingZoom(courseId);
      await api.retryZoom(courseId);
      alert("La réunion Zoom a été créée avec succès !");
      await loadCourses();
    } catch (err) {
      alert(err.message || "Erreur lors de la création de la réunion Zoom");
    } finally {
      setRetryingZoom(null);
    }
  };

  const getCourseStatus = (course) => {
    if (course.status === 'cancelled') {
      return { text: 'ANNULÉ', color: '#dc3545', isCancelled: true };
    }
    
    if (course.course_date) {
      const courseDate = new Date(course.course_date);
      const now = new Date();
      
      const isPast = courseDate < now;
      
      // Contrainte des 3 jours pour l'annulation
      const limitDate = new Date(courseDate);
      limitDate.setDate(limitDate.getDate() - 3);
      const canCancel = !isPast && now <= limitDate && course.status !== 'cancelled';

      if (isPast) {
        return { text: 'Passé', color: '#6c757d', isPast: true, canCancel: false };
      }
      
      return { 
        text: courseDate.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }), 
        color: '#28a745',
        isFuture: true,
        canCancel: canCancel
      };
    }
    
    return { text: 'Date non définie', color: '#6c757d', canCancel: false };
  };

  return (
    <TeacherDashboardShell
      title="Mes cours"
      subtitle="Gerez vos contenus, consultez vos apprenants et preparez vos prochaines sessions."
      actions={
        <Link to="/dashboard/teacher/courses/new">
          <Button variant="primary" size="small">
            Creer un cours
          </Button>
        </Link>
      }
    >
      {error && <section className="teacher-panel">{error}</section>}

      {loading ? (
        <section className="teacher-panel">Chargement de vos cours...</section>
      ) : courses.length === 0 ? (
        <section className="teacher-panel">
          <div className="teacher-callout">
            Aucun cours pour le moment. Lancez votre premier cours depuis le formulaire de creation.
          </div>
        </section>
      ) : (
        <section className="teacher-panel">
          <div className="teacher-list">
            {courses.map((course) => {
              const courseStatus = getCourseStatus(course);
              return (
                <article key={course.id} className="teacher-list-item">
                  <div>
                    <h3>{course.title}</h3>
                    <p>
                      {course.discipline || "Discipline a definir"} · {course.format || "Format non precise"} ·
                      slug: {course.slug}
                    </p>
                    <p style={{ 
                      color: courseStatus.color, 
                      fontWeight: courseStatus.isCancelled ? 'bold' : 'normal',
                      marginTop: '8px'
                    }}>
                      📅 {courseStatus.text}
                      {course.enrolled_count !== undefined && (
                        <span style={{ marginLeft: '15px', color: '#1A1F71' }}>
                          👥 {course.enrolled_count}/{course.max_students || '∞'} inscrits
                        </span>
                      )}
                    </p>
                    {course.format === 'live' && !course.zoom_meeting_id && course.status !== 'cancelled' && (
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        backgroundColor: '#fff3cd', 
                        border: '1px solid #ffeeba',
                        borderRadius: '4px',
                        color: '#856404',
                        fontSize: '0.9em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>⚠️ Zoom non configuré</span>
                        <Button 
                          variant="outline" 
                          size="small" 
                          onClick={() => handleRetryZoom(course.id)}
                          disabled={retryingZoom === course.id}
                          style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '0.8em' }}
                        >
                          {retryingZoom === course.id ? 'Création...' : 'Créer réunion Zoom'}
                        </Button>
                      </div>
                    )}
                    {selected === course.id && (
                      <div className="teacher-callout" style={{ marginTop: "10px" }}>
                        <strong>Inscrits:</strong>
                        {enrollments.length === 0 ? (
                          <p>Aucun inscrit pour le moment.</p>
                        ) : (
                          <ul>
                            {enrollments.map((enrollment) => (
                              <li key={enrollment.id}>
                                {enrollment.email} - inscrit le{" "}
                                {new Date(enrollment.created_at).toLocaleDateString("fr-FR")}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button variant="outline" size="small" onClick={() => loadEnrollments(course.id)}>
                      Voir inscrits
                    </Button>
                    {courseStatus.canCancel && (
                      <Button 
                        variant="outline" 
                        size="small" 
                        onClick={() => handleCancelCourse(course)}
                        disabled={cancelling}
                        style={{ color: '#dc3545', borderColor: '#dc3545' }}
                      >
                        {cancelling ? 'Annulation...' : 'Annuler le cours'}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </TeacherDashboardShell>
  );
}
