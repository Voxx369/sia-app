import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";

export default function MyCourses() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.myCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message || "Impossible de charger vos cours");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const userLabel = useMemo(() => {
    if (!user?.email) return "membre";
    return user.email.split("@")[0];
  }, [user?.email]);

  if (!token) return <Navigate to="/dashboard" replace />;

  return (
    <TeacherDashboardShell
      title="Cours suivis"
      subtitle={`Bienvenue ${userLabel}, vous etes inscrit a ${courses.length} cours.`}
      actions={
        <Link to="/tous-les-cours-en-ligne">
          <Button variant="outline" size="small">
            Explorer les cours
          </Button>
        </Link>
      }
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}

      {loading ? (
        <section className="teacher-panel">Chargement de vos cours...</section>
      ) : courses.length === 0 ? (
        <section className="teacher-panel">
          <div className="teacher-callout">
            <p>Vous n&apos;etes inscrit a aucun cours pour le moment.</p>
            <div style={{ marginTop: "12px" }}>
              <Link to="/tous-les-cours-en-ligne">
                <Button variant="primary" size="small">
                  Decouvrir les cours
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="teacher-panel-grid teacher-panel-grid-3">
            <section className="teacher-panel">
              <p className="teacher-kpi-label">Cours actifs</p>
              <p className="teacher-kpi">{courses.length}</p>
            </section>
            <section className="teacher-panel">
              <p className="teacher-kpi-label">Progression</p>
              <p className="teacher-kpi">En cours</p>
            </section>
            <section className="teacher-panel">
              <p className="teacher-kpi-label">Acces</p>
              <p className="teacher-kpi">Illimite</p>
            </section>
          </div>

          <section className="teacher-panel">
            <div className="dashboard-course-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollmentDate={course.enrollment_date || course.created_at}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </TeacherDashboardShell>
  );
}
