import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import Button from "../components/Button";

export default function DashboardCalendar() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const my = await api.myCourses();
        const mine = (my || [])
          .filter((c) => c.course_date && c.status !== "cancelled")
          .map((c) => ({
            id: c.id,
            title: c.title,
            discipline: c.discipline,
            datetime: new Date(c.course_date),
            role: "student",
          }));
        let teaching = [];
        if (user?.role === "teacher") {
          try {
            const t = await api.myTeacherCourses();
            teaching = (t || [])
              .filter((c) => c.course_date && c.status !== "cancelled")
              .map((c) => ({
                id: c.id,
                title: c.title,
                discipline: c.discipline,
                datetime: new Date(c.course_date),
                role: "teacher",
              }));
          } catch (err) {
            console.error("Erreur lors de la récupération des cours profs", err);
          }
        }
        const now = new Date();
        const combined = [...mine, ...teaching]
          .filter((e) => e.datetime > now)
          .sort((a, b) => a.datetime - b.datetime);
        setEvents(combined);
      } catch (err) {
        setError(err.message || "Impossible de charger le calendrier");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user?.role]);

  const daysMatrix = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const totalDays = last.getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [viewYear, viewMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const y = e.datetime.getFullYear();
      const m = String(e.datetime.getMonth() + 1).padStart(2, "0");
      const d = String(e.datetime.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return map;
  }, [events]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });

  const isToday = (date) => {
    if (!date) return false;
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const goPrevMonth = () => {
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(m);
    }
  };

  const goNextMonth = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(m);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  if (!token) return <Navigate to="/dashboard" replace />;

  return (
    <TeacherDashboardShell
      title="Calendar"
      subtitle="Consultez vos prochains cours et sessions."
      actions={
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="outline" size="small" onClick={goPrevMonth}>Mois prec.</Button>
          <Button variant="outline" size="small" onClick={goToday}>Aujourd'hui</Button>
          <Button variant="outline" size="small" onClick={goNextMonth}>Mois suiv.</Button>
        </div>
      }
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}
      {loading ? (
        <section className="teacher-panel">Chargement du calendrier...</section>
      ) : (
        <>
          <section className="teacher-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{monthLabel}</h3>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.9rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: "#1A1F71", borderRadius: 2 }}></span> Etudiant
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, background: "#28a745", borderRadius: 2 }}></span> Enseignant
                </span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} style={{ fontWeight: 600, color: "#1A1F71" }}>{d}</div>
              ))}
              {daysMatrix.flat().map((date, idx) => {
                const key =
                  date
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                    : `empty-${idx}`;
                const dayEvents = date ? (eventsByDay.get(key) || []) : [];
                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      minHeight: 100,
                      padding: 8,
                      background: date ? (isToday(date) ? "#f0f7ff" : "#fff") : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600 }}>{date ? date.getDate() : ""}</span>
                      {dayEvents.length > 0 && (
                        <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>{dayEvents.length}</span>
                      )}
                    </div>
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={`${e.id}-${e.datetime.toISOString()}`}
                        style={{
                          marginTop: 6,
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: e.role === "teacher" ? "#e8f6ee" : "#eef2ff",
                          border: `1px solid ${e.role === "teacher" ? "#28a745" : "#1A1F71"}`,
                          fontSize: "0.85rem",
                        }}
                        title={`${e.title} · ${e.discipline || "General"}`}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{e.title}</span>
                          <span style={{ color: "#0f172a" }}>
                            {e.datetime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ color: "#6c757d" }}>{e.discipline || ""}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ marginTop: 6, fontSize: "0.8rem", color: "#6c757d" }}>
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="teacher-panel">
            <h3 style={{ marginTop: 0 }}>Prochains cours</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {events.slice(0, 10).map((e) => (
                <div
                  key={`${e.id}-${e.datetime.toISOString()}`}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: e.role === "teacher" ? "#28a745" : "#1A1F71",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                      {e.discipline || "General"} · {e.datetime.toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })} · {e.datetime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ color: "#6c757d" }}>Aucun cours a venir</div>
              )}
            </div>
          </section>
        </>
      )}
    </TeacherDashboardShell>
  );
}
