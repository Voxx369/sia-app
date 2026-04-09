import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function DashboardAnalytics() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || user?.role !== "teacher") return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const courses = await api.myTeacherCourses();
        const enriched = await Promise.all(
          courses.map(async (course) => {
            try {
              const enrollments = await api.courseEnrollments(course.id);
              return { ...course, enrollmentCount: enrollments.length };
            } catch {
              return { ...course, enrollmentCount: 0 };
            }
          })
        );
        setRows(enriched);
      } catch (err) {
        setError(err.message || "Impossible de charger les analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, user?.role]);

  const totals = useMemo(() => {
    const totalCourses = rows.length;
    const totalEnrollments = rows.reduce((sum, row) => sum + row.enrollmentCount, 0);
    const averageEnrollments = totalCourses ? (totalEnrollments / totalCourses).toFixed(1) : "0.0";
    return { totalCourses, totalEnrollments, averageEnrollments };
  }, [rows]);

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  return (
    <TeacherDashboardShell
      title="Analytics"
      subtitle="Vue d'ensemble de vos cours et inscriptions."
    >
      <div className="teacher-panel-grid teacher-panel-grid-3">
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Cours actifs</p>
          <p className="teacher-kpi">{totals.totalCourses}</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Inscriptions totales</p>
          <p className="teacher-kpi">{totals.totalEnrollments}</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Moyenne / cours</p>
          <p className="teacher-kpi">{totals.averageEnrollments}</p>
        </section>
      </div>

      <section className="teacher-panel">
        <h2>Detail par cours</h2>
        {loading ? (
          <p>Chargement des donnees...</p>
        ) : error ? (
          <p>{error}</p>
        ) : rows.length === 0 ? (
          <div className="teacher-callout">
            Aucun cours trouve. Creez un cours pour commencer a suivre vos performances.
          </div>
        ) : (
          <div className="teacher-table-wrap">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Discipline</th>
                  <th>Format</th>
                  <th>Inscriptions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.discipline || "N/A"}</td>
                    <td>{row.format || "N/A"}</td>
                    <td>{row.enrollmentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TeacherDashboardShell>
  );
}
