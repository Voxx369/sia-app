import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Button from "../components/Button";

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDisciplineSlug(discipline) {
  if (!discipline) return "art";
  return discipline
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "art";
}

function formatStars(value) {
  if (value === null || value === undefined) return "";
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value))));
  return "\u2605".repeat(rounded) + "\u2606".repeat(5 - rounded);
}

function ReviewList({ emptyLabel, reviews, isTeacherView }) {
  return (
    <section className="teacher-panel">
      {reviews.length === 0 ? (
        <p>{emptyLabel}</p>
      ) : (
        <div className="dashboard-course-grid">
          {reviews.map((review) => (
            <article key={review.id} className="dashboard-review-card">
              <div className="dashboard-review-header">
                <div className="dashboard-review-course">
                  <Link
                    to={`/tous-les-cours/${encodeURIComponent(
                      toDisciplineSlug(review.course.discipline)
                    )}/${encodeURIComponent(review.course.slug)}`}
                  >
                    <h3 className="dashboard-review-title">{review.course.title}</h3>
                  </Link>
                  <div className="dashboard-review-discipline">
                    {review.course.discipline}
                  </div>
                </div>
                <p className="dashboard-review-meta">
                  {isTeacherView ? (
                    <>
                      Avis laisse par {review.student?.email || "un eleve"} le{" "}
                      {formatDate(review.created_at)}
                    </>
                  ) : (
                    <>
                      Avis laisse le {formatDate(review.created_at)} pour le cours de{" "}
                      {review.teacher?.email || "votre enseignant"}
                    </>
                  )}
                </p>
                <div className="dashboard-review-rating">
                  <span className="dashboard-review-stars">
                    {formatStars(review.rating)}
                  </span>
                  <span className="dashboard-review-rating-value">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="dashboard-review-comment">{review.comment}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardReviews() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [teacherReviews, setTeacherReviews] = useState([]);
  const [error, setError] = useState("");
  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listMyReviews();
        if (!ignore) {
          setMyReviews(data?.reviews || []);
        }

        if (isTeacher) {
          const teacherData = await api.listMyTeacherReviews();
          if (!ignore) {
            setTeacherReviews(teacherData?.reviews || []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger les avis");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [token, isTeacher]);

  if (!token) return <Navigate to="/dashboard" replace />;

  return (
    <TeacherDashboardShell
      title="Avis"
      subtitle={isTeacher ? "Les avis laissés par les élèves" : "Vos avis sur les cours"}
      actions={
        <Link to="/tous-les-cours-en-ligne">
          <Button variant="primary" size="small">
            Explorer les cours
          </Button>
        </Link>
      }
    >
      {loading && (
        <section className="teacher-panel">
          <p>Chargement des avis...</p>
        </section>
      )}

      {!loading && error && (
        <section className="teacher-panel">
          <p className="error-message">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          {isTeacher && (
            <ReviewList
              emptyLabel="Vous n'avez pas encore recu d'avis sur vos cours."
              reviews={teacherReviews}
              isTeacherView
            />
          )}

          {(!isTeacher || myReviews.length > 0) && (
            <ReviewList
              emptyLabel="Vous n'avez pas encore laisse d'avis sur un cours."
              reviews={myReviews}
            />
          )}
        </>
      )}
    </TeacherDashboardShell>
  );
}
