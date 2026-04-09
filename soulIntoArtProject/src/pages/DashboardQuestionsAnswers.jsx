import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import Button from "../components/Button";

export default function DashboardQuestionsAnswers() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [questionDraft, setQuestionDraft] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const [teacherQuestions, setTeacherQuestions] = useState([]);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const isTeacher = user?.role === "teacher";
  const [myQuestions, setMyQuestions] = useState([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isTeacher) {
          const data = await api.myTeacherQuestions();
          setTeacherQuestions(data.questions || []);
        } else {
          const my = await api.myCourses();
          setEnrolledCourses(my || []);
          if (my?.length) setSelectedCourseId(String(my[0].id));
          try {
            const mine = await api.myQuestions();
            setMyQuestions(mine.questions || []);
          } catch {
            setMyQuestions([]);
          }
        }
      } catch (err) {
        setError(err.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isTeacher]);

  const selectedCourse = useMemo(
    () => enrolledCourses.find((c) => String(c.id) === String(selectedCourseId)),
    [enrolledCourses, selectedCourseId]
  );

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !questionDraft.title.trim() || !questionDraft.body.trim()) return;
    setSubmitting(true);
    setToast("");
    try {
      await api.createCourseQuestion(Number(selectedCourseId), {
        title: questionDraft.title.trim(),
        body: questionDraft.body.trim(),
      });
      setQuestionDraft({ title: "", body: "" });
      setToast("Question envoyée");
    } catch (err) {
      setToast(err.message || "Impossible d'envoyer la question");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handleSendAnswer = async (questionId) => {
    const text = (answerDrafts[questionId] || "").trim();
    if (!text) return;
    setSubmitting(true);
    setToast("");
    try {
      await api.postAnswer(questionId, { body: text });
      const data = await api.myTeacherQuestions();
      setTeacherQuestions(data.questions || []);
      setAnswerDrafts((d) => ({ ...d, [questionId]: "" }));
      setToast("Réponse envoyée");
    } catch (err) {
      setToast(err.message || "Impossible d'envoyer la réponse");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  if (!token) return <Navigate to="/dashboard" replace />;

  return (
    <TeacherDashboardShell
      title="Questions & réponses"
      subtitle={isTeacher ? "Répondez aux questions liées à vos cours." : "Posez vos questions à vos enseignants."}
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}
      {loading ? (
        <section className="teacher-panel">Chargement...</section>
      ) : isTeacher ? (
        <section className="teacher-panel">
          {toast && <div className="teacher-callout">{toast}</div>}
          {teacherQuestions.length === 0 ? (
            <p>Aucune question reçue pour le moment.</p>
          ) : (
            <div className="teacher-list">
              {teacherQuestions.map((q) => (
                <article key={q.id} className="teacher-list-item">
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{q.title}</h3>
                    <p style={{ color: "#6c757d", margin: 0 }}>Cours · {q.course_title}</p>
                    <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{q.body}</p>
                    <p style={{ color: "#6c757d", marginTop: 6, fontSize: "0.9rem" }}>
                      {new Date(q.created_at).toLocaleDateString("fr-FR")} · {q.author_email}
                    </p>
                    <div style={{ marginTop: 10 }}>
                      {q.answers.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: 10,
                            marginTop: 8,
                            background: "#fff",
                          }}
                        >
                          <div style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
                          <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#6c757d" }}>
                            {new Date(a.created_at).toLocaleDateString("fr-FR")} · {a.author_email}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        className="review-textarea"
                        placeholder="Votre réponse"
                        value={answerDrafts[q.id] || ""}
                        onChange={(e) => setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Button variant="primary" size="small" onClick={() => handleSendAnswer(q.id)} disabled={submitting}>
                          Envoyer la réponse
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="teacher-panel">
          {toast && <div className="teacher-callout">{toast}</div>}
          {enrolledCourses.length === 0 ? (
            <p>Vous n'êtes inscrit à aucun cours pour le moment.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ flex: 1 }}>
                  <span style={{ display: "block", marginBottom: 6 }}>Cours</span>
                  <select
                    className="teacher-select"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {enrolledCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <form onSubmit={handleSubmitQuestion} className="teacher-form-grid" style={{ marginTop: 16 }}>
                <label>
                  Titre
                  <input
                    className="teacher-input"
                    value={questionDraft.title}
                    onChange={(e) => setQuestionDraft((q) => ({ ...q, title: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Question
                  <textarea
                    className="teacher-textarea"
                    rows={5}
                    value={questionDraft.body}
                    onChange={(e) => setQuestionDraft((q) => ({ ...q, body: e.target.value }))}
                    required
                  />
                </label>
                <Button type="submit" variant="primary" size="medium" disabled={submitting}>
                  {submitting ? "Envoi..." : "Envoyer la question"}
                </Button>
              </form>
              {selectedCourse && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ color: "#6c757d" }}>
                    Votre question sera transmise à l'enseignant du cours “{selectedCourse.title}”.
                  </p>
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <h3 style={{ margin: 0 }}>Vos questions</h3>
                {myQuestions.length === 0 ? (
                  <p style={{ color: "#6c757d" }}>Aucune question posée pour le moment.</p>
                ) : (
                  <div className="teacher-list">
                    {myQuestions.map((q) => (
                      <article key={q.id} className="teacher-list-item">
                        <div>
                          <h4 style={{ marginBottom: 4 }}>{q.title}</h4>
                          <p style={{ color: "#6c757d", margin: 0 }}>Cours · {q.course_title}</p>
                          <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{q.body}</p>
                          <div style={{ marginTop: 8 }}>
                            {q.answers.length === 0 ? (
                              <span style={{ color: "#6c757d" }}>En attente de réponse...</span>
                            ) : (
                              q.answers.map((a) => (
                                <div
                                  key={a.id}
                                  style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: 10,
                                    marginTop: 8,
                                  }}
                                >
                                  <div style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
                                  <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#6c757d" }}>
                                    {new Date(a.created_at).toLocaleDateString("fr-FR")} · {a.author_email}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <p style={{ color: "#6c757d", marginTop: 8, fontSize: "0.9rem" }}>
                            Posée le {new Date(q.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </TeacherDashboardShell>
  );
}
