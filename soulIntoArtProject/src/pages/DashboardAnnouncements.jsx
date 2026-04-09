import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function DashboardAnnouncements() {
  const { token, user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "followers",
    course_id: "",
  });

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isTeacher) {
          const [items, teacherCourses] = await Promise.all([
            api.listMyAnnouncements(),
            api.myTeacherCourses(),
          ]);
          if (!ignore) {
            setAnnouncements(items || []);
            setCourses(teacherCourses || []);
          }
        } else {
          const feed = await api.listAnnouncementFeed();
          if (!ignore) {
            setAnnouncements(feed || []);
            setCourses([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger vos annonces");
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

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
      course_id: form.audience === "course" ? Number(form.course_id) : undefined,
    };

    try {
      const created = await api.createAnnouncement(payload);
      setAnnouncements((current) => [created, ...current]);
      setForm({ title: "", message: "", audience: "followers", course_id: "" });
      setError("");
    } catch (err) {
      setError(err.message || "Impossible de publier l'annonce");
    }
  };

  return (
    <TeacherDashboardShell
      title="Annonces"
      subtitle={
        isTeacher
          ? "Communiquez les mises a jour importantes a vos apprenants."
          : "Retrouvez les annonces publiees par les profs de vos cours."
      }
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}

      <div className="teacher-panel-grid teacher-panel-grid-2">
        {isTeacher ? (
          <section className="teacher-panel">
            <h2>Nouvelle annonce</h2>
            <form className="teacher-form-grid" onSubmit={submitAnnouncement}>
              <label>
                Titre
                <input
                  className="teacher-input"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ex: Changement d'horaire atelier"
                />
              </label>

              <label>
                Audience
                <select
                  className="teacher-select"
                  value={form.audience}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      audience: event.target.value,
                      course_id: event.target.value === "course" ? current.course_id : "",
                    }))
                  }
                >
                  <option value="followers">Prof suivi</option>
                  <option value="course">Cours specifique</option>
                </select>
              </label>

              {form.audience === "course" && (
                <label>
                  Cours cible
                  <select
                    className="teacher-select"
                    value={form.course_id}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, course_id: event.target.value }))
                    }
                  >
                    <option value="">Selectionnez un cours</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Message
                <textarea
                  className="teacher-textarea"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Votre message..."
                />
              </label>
              <Button type="submit" variant="primary" size="medium">
                Publier l'annonce
              </Button>
            </form>
          </section>
        ) : (
          <section className="teacher-panel">
            <h2>Fil des annonces</h2>
            <p>
              Vous voyez ici les annonces publiees par les profs des cours que vous suivez.
            </p>
          </section>
        )}

        <section className="teacher-panel">
          <h2>{isTeacher ? "Historique recent" : "Dernieres annonces"}</h2>
          {loading ? (
            <p>Chargement des annonces...</p>
          ) : announcements.length === 0 ? (
            <div className="teacher-callout">Aucune annonce publiee pour le moment.</div>
          ) : (
            <div className="teacher-list">
              {announcements.map((item) => (
                <article key={item.id} className="teacher-list-item">
                  <div>
                    <span className="teacher-badge">
                      {item.audience === "course" ? item.course_title || "Cours" : "Prof suivi"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.message}</p>
                    {!isTeacher && (
                      <p>
                        Par {item.author?.display_name || item.author?.email || "Prof"}
                      </p>
                    )}
                  </div>
                  <p>{new Date(item.published_at || item.created_at).toLocaleDateString("fr-FR")}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </TeacherDashboardShell>
  );
}
