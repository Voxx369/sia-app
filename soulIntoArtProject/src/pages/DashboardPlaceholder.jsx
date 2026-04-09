import { Link, Navigate } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";

export default function DashboardPlaceholder({
  title,
  description,
  ctaTo,
  ctaLabel,
  teacherOnly = false,
}) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/dashboard" replace />;
  if (teacherOnly && user?.role !== "teacher") {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return (
    <TeacherDashboardShell title={title} subtitle={description}>
      <section className="teacher-panel">
        <div className="teacher-callout">
          <p>{description}</p>
          {ctaTo && ctaLabel && (
            <div style={{ marginTop: "14px" }}>
              <Link to={ctaTo}>
                <Button variant="primary" size="small">
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </TeacherDashboardShell>
  );
}
