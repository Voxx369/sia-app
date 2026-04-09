import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const zoomSessions = [
  {
    id: 1,
    title: "Atelier collage intuitif",
    date: "2026-02-14 18:00",
    status: "Planifie",
  },
  {
    id: 2,
    title: "Aquarelle - paysages expressifs",
    date: "2026-02-17 19:00",
    status: "Planifie",
  },
];

export default function DashboardZoom() {
  const { token, user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (token && user?.role === "teacher") {
      const loadConfig = async () => {
        try {
          const config = await api.getZoomConfig();
          setApiKey(config.zoom_api_key || "");
          setApiSecret(config.zoom_api_secret || "");
          setAccountId(config.zoom_account_id || "");
        } catch (err) {
          console.error("Failed to load Zoom config", err);
        }
      };
      loadConfig();
    }
  }, [token, user]);

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNote("");
    try {
      await api.updateZoomConfig({
        zoom_api_key: apiKey,
        zoom_api_secret: apiSecret,
        zoom_account_id: accountId,
      });
      setNote("Configuration sauvegardée avec succès !");
      setTimeout(() => setNote(""), 3000);
    } catch (err) {
      setNote("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherDashboardShell
      title="Zoom"
      subtitle="Configurez votre intégration Zoom et vos sessions live."
    >
      <div className="teacher-panel-grid teacher-panel-grid-2">
        <section className="teacher-panel">
          <h2>Configuration API</h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-gray)", marginBottom: "16px" }}>
            Connectez votre compte Zoom (Server-to-Server OAuth) pour créer automatiquement des réunions pour vos cours en live.
          </p>
          <form className="teacher-form-grid" onSubmit={handleSave}>
            <label>
              Account ID
              <input
                className="teacher-input"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                placeholder="Votre Zoom Account ID"
                required
              />
            </label>
            <label>
              Client ID
              <input
                className="teacher-input"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Votre Zoom Client ID"
                required
              />
            </label>
            <label>
              Client Secret
              <input
                className="teacher-input"
                type="password"
                value={apiSecret}
                onChange={(event) => setApiSecret(event.target.value)}
                placeholder="Votre Zoom Client Secret"
                required
              />
            </label>
            <Button type="submit" variant="primary" size="medium" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer la configuration"}
            </Button>
            {note && (
              <p style={{ 
                marginTop: "12px", 
                color: note.includes("Erreur") ? "red" : "green",
                fontSize: "14px"
              }}>
                {note}
              </p>
            )}
          </form>
        </section>

        <section className="teacher-panel">
          <h2>Sessions programmées</h2>
          <div className="teacher-list">
            {zoomSessions.map((session) => (
              <article key={session.id} className="teacher-list-item">
                <div>
                  <h3>{session.title}</h3>
                  <p>{new Date(session.date).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <span className="teacher-badge">{session.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </TeacherDashboardShell>
  );
}
