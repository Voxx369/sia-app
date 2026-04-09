import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Toast from "../components/Toast";
import TeacherDashboardShell from "../components/TeacherDashboardShell";

export default function CreateCourse() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    discipline: "",
    level: "Débutant",
    format: "replay",
    description: "",
    price_cents: 0,
    course_date_only: "",
    course_hour: "14",
    course_minute: "00",
    min_students: 1,
    max_students: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setToast({ message: "", type: "success" });
    
    // Combiner la date et l'heure
    const course_date = form.course_date_only && form.course_hour && form.course_minute
      ? `${form.course_date_only}T${form.course_hour}:${form.course_minute}` 
      : null;
    
    // Vérifier que la date est au moins dans 7 jours
    if (course_date) {
      const selectedDate = new Date(course_date);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      
      if (selectedDate < minDate) {
        setToast({ message: "La date du cours doit être au minimum dans une semaine (7 jours)", type: "error" });
        return;
      }
    }
    
    setLoading(true);
    try {
      const slug = generateSlug(form.title);
      await api.createCourse({
        title: form.title,
        discipline: form.discipline,
        level: form.level,
        format: form.format,
        description: form.description,
        slug,
        price_cents: Number(form.price_cents) || 0,
        course_date,
        min_students: Number(form.min_students) || 1,
        max_students: form.max_students ? Number(form.max_students) : null,
      });
      setToast({ message: "Cours créé avec succès !", type: "success" });
      setForm({
        title: "",
        discipline: "",
        level: "Débutant",
        format: "replay",
        description: "",
        price_cents: 0,
        course_date_only: "",
        course_hour: "14",
        course_minute: "00",
        min_students: 1,
        max_students: "",
      });
    } catch (err) {
      setToast({ message: err.message || "Impossible de créer le cours", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })}
      />
      <TeacherDashboardShell
        title="Creer un cours"
        subtitle="Ajoutez votre nouvelle offre pour la rendre disponible sur la plateforme."
        actions={
          <Link to="/dashboard/teacher/courses">
            <Button variant="outline" size="small">
              Retour a mes cours
            </Button>
          </Link>
        }
      >
      <section className="teacher-panel">
        <form onSubmit={onSubmit} className="teacher-form-grid">
          <label>
            Titre
            <input
              className="teacher-input"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              required
            />
          </label>
          <label>
            Discipline
            <input
              className="teacher-input"
              value={form.discipline}
              onChange={(event) => onChange("discipline", event.target.value)}
              placeholder="Ex: aquarelle, collage..."
              required
            />
          </label>
          <label>
            Niveau
            <select
              className="teacher-select"
              value={form.level}
              onChange={(event) => onChange("level", event.target.value)}
              required
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </label>
          <label>
            Format
            <select
              className="teacher-select"
              value={form.format}
              onChange={(event) => onChange("format", event.target.value)}
            >
              <option value="replay">Replay</option>
              <option value="live">Live</option>
            </select>
          </label>
          <label>
            Description
            <textarea
              className="teacher-textarea"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={4}
              required
            />
          </label>
          <label>
            Prix (centimes)
            <input
              className="teacher-input"
              type="number"
              value={form.price_cents}
              onChange={(event) => onChange("price_cents", event.target.value)}
            />
          </label>
          <label>
            Date du cours (minimum dans 7 jours)
            <input
              className="teacher-input"
              type="date"
              value={form.course_date_only}
              min={(() => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().slice(0, 10);
              })()}
              onChange={(event) => onChange("course_date_only", event.target.value)}
              required
            />
          </label>
          <label>
            Heure du cours
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="teacher-select"
                value={form.course_hour}
                onChange={(event) => onChange("course_hour", event.target.value)}
                required
                style={{ flex: 1 }}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return <option key={hour} value={hour}>{hour}h</option>;
                })}
              </select>
              <select
                className="teacher-select"
                value={form.course_minute}
                onChange={(event) => onChange("course_minute", event.target.value)}
                required
                style={{ flex: 1 }}
              >
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </label>
          <label>
            Nombre minimum d'étudiants
            <input
              className="teacher-input"
              type="number"
              min="1"
              value={form.min_students}
              onChange={(event) => onChange("min_students", event.target.value)}
            />
          </label>
          <label>
            Nombre maximum d'étudiants
            <input
              className="teacher-input"
              type="number"
              min="1"
              value={form.max_students}
              onChange={(event) => onChange("max_students", event.target.value)}
              required
            />
          </label>
          <Button type="submit" variant="primary" size="medium" disabled={loading}>
            {loading ? "Creation..." : "Creer le cours"}
          </Button>
        </form>
      </section>
    </TeacherDashboardShell>
    </>
  );
}
