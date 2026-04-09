import { useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function DashboardSubscriptions() {
  const { token } = useAuth();
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const subs = await api.getMySubscriptions();
        console.log('📋 Abonnements reçus:', subs);
        setSubscriptions(subs);
      } catch (err) {
        console.error('❌ Erreur chargement abonnements:', err);
        setError(err.message || "Impossible de charger les abonnements");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [token, refreshKey]);

  // Rafraîchir si on arrive avec state.refresh
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('🔄 Rafraîchissement forcé des abonnements');
      setRefreshKey(prev => prev + 1);
    }
  }, [location]);

  if (!token) return <Navigate to="/dashboard" replace />;

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) return;

    try {
      await api.cancelSubscription(subscriptionId);
      setSubscriptions((subs) => subs.filter((s) => s.id !== subscriptionId));
      setNote("Abonnement annulé avec succès.");
      setTimeout(() => setNote(""), 2500);
    } catch (err) {
      setError(err.message || "Impossible d'annuler l'abonnement");
    }
  };

  return (
    <TeacherDashboardShell
      title="Mes abonnements"
      subtitle="Gérez vos abonnements aux professeurs"
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}
      {note && <section className="teacher-panel dashboard-success">{note}</section>}

      <section className="teacher-panel">
        {loading ? (
          <p>Chargement des abonnements...</p>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <h3>Aucun abonnement actif</h3>
            <p style={{ marginTop: "1rem", color: "#666" }}>
              Abonnez-vous à vos professeurs préférés pour accéder à leurs contenus.
            </p>
            <Link to="/offre-abonnements" style={{ marginTop: "2rem", display: "inline-block" }}>
              <Button variant="primary" size="large">
                Découvrir les abonnements
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="subscriptions-header" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "#666" }}>Vous avez {subscriptions.length} abonnement{subscriptions.length > 1 ? "s" : ""}</p>
              <Link to="/offre-abonnements">
                <Button variant="outline" size="small">
                  Nouvel abonnement
                </Button>
              </Link>
            </div>

            <div className="subscriptions-list">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="subscription-item">
                  <div className="subscription-info">
                    <h3>{sub.teacher_name || sub.teacher_email}</h3>
                    <p className="subscription-type">
                      {sub.type === "artist_subscription" ? "Abonnement Artiste" : "Autre Abonnement"}
                    </p>
                    {sub.type === "artist_subscription" && (
                      <p className="subscription-free-courses">
                        🎁 {sub.free_courses_limit - sub.free_courses_used} cours gratuit{(sub.free_courses_limit - sub.free_courses_used) > 1 ? 's' : ''} ce mois-ci
                      </p>
                    )}
                    <p className="subscription-price">
                      {(sub.price_cents / 100).toFixed(2)}€/mois
                    </p>
                    <p className="subscription-dates">
                      Du {new Date(sub.start_date).toLocaleDateString()} au{" "}
                      {new Date(sub.end_date).toLocaleDateString()}
                    </p>
                    <p className={`subscription-status ${sub.status}`}>
                      {sub.status === "active"
                        ? "✓ Actif"
                        : sub.status === "cancelled"
                        ? "✗ Annulé"
                        : "⏱ Expiré"}
                    </p>
                  </div>
                  {sub.status === "active" && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleCancelSubscription(sub.id)}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </TeacherDashboardShell>
  );
}
