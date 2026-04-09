import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const studentQuickLinks = [
  { to: "/dashboard/my-courses", label: "Voir mes cours" },
  { to: "/tous-les-cours-en-ligne", label: "Explorer tous les cours" },
  { to: "/dashboard/wishlist", label: "Ouvrir ma wishlist" },
];

const teacherQuickLinks = [
  { to: "/dashboard/teacher/courses", label: "Gerer mes cours" },
  { to: "/dashboard/teacher/courses/new", label: "Creer un cours" },
  { to: "/dashboard/announcements", label: "Publier une annonce" },
];

export default function DashboardOverview() {
  const { token, user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!token) return;

      try {
        const subs = await api.getActiveSubscriptions();
        setSubscriptions(subs);
      } catch (err) {
        console.error("Erreur lors du chargement des abonnements:", err);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    loadSubscriptions();
  }, [token]);

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!token || user?.role !== "teacher") return;

      try {
        const subs = await api.getMySubscribers();
        setSubscribers(subs);
      } catch (err) {
        console.error("Erreur lors du chargement des abonnés:", err);
      } finally {
        setLoadingSubscribers(false);
      }
    };

    loadSubscribers();
  }, [token, user]);

  if (!token) return <Navigate to="/dashboard" replace />;

  const isTeacher = user?.role === "teacher";
  const quickLinks = isTeacher ? teacherQuickLinks : studentQuickLinks;

  return (
    <TeacherDashboardShell
      title="Tableau de bord"
      subtitle={
        isTeacher
          ? "Pilotez votre activite artiste et vos cours depuis cet espace."
          : "Retrouvez vos cours, vos favoris et votre progression."
      }
    >
      <div className="teacher-panel-grid teacher-panel-grid-3">
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Role</p>
          <p className="teacher-kpi">{isTeacher ? "Artiste" : "Eleve"}</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Compte</p>
          <p className="teacher-kpi">Actif</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Acces</p>
          <p className="teacher-kpi">Dashboard</p>
        </section>
      </div>

      <section className="teacher-panel">
        <h2>Acces rapides</h2>
        <div className="dashboard-quick-links">
          {quickLinks.map((item) => (
            <Link key={item.to} className="dashboard-quick-link" to={item.to}>
              <span>{item.label}</span>
              <span aria-hidden="true">{">"}</span>
            </Link>
          ))}
        </div>
      </section>

      {isTeacher && (
        <section className="teacher-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Mes abonnés</h2>
            <Link to="/dashboard/teacher/subscribers" style={{ color: "#00bcd4", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
              Voir tout →
            </Link>
          </div>
          
          {loadingSubscribers ? (
            <p style={{ color: "#666" }}>Chargement...</p>
          ) : subscribers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "#666", marginBottom: "0.5rem" }}>Vous n'avez aucun abonné pour le moment.</p>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Les élèves pourront s'abonner à vos cours depuis votre profil.</p>
            </div>
          ) : (
            <div>
              <div className="teacher-panel-grid teacher-panel-grid-2" style={{ marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>Abonnement Artiste</p>
                  <p style={{ margin: 0, color: "#1a1f71", fontSize: "1.5rem", fontWeight: "bold" }}>
                    {subscribers.filter(s => s.type === 'artist_subscription').length}
                  </p>
                </div>
                <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>Autre Abonnement</p>
                  <p style={{ margin: 0, color: "#1a1f71", fontSize: "1.5rem", fontWeight: "bold" }}>
                    {subscribers.filter(s => s.type === 'other_subscription').length}
                  </p>
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "#333" }}>Derniers abonnés</h3>
                {subscribers.slice(0, 3).map((sub) => (
                  <div key={sub.id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    background: "#f9f9f9",
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontWeight: 600 }}>
                        {sub.student_email}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#00bcd4" }}>
                        {sub.type === "artist_subscription" ? "Abonnement Artiste" : "Autre Abonnement"} • {(sub.price_cents / 100).toFixed(2)}€/mois
                      </p>
                    </div>
                    <span style={{ color: "#4caf50", fontSize: "0.9rem" }}>✓</span>
                  </div>
                ))}
              </div>
              {subscribers.length > 3 && (
                <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
                  Et {subscribers.length - 3} autre{subscribers.length - 3 > 1 ? "s" : ""}...
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {!isTeacher && (
        <section className="teacher-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Mes abonnements</h2>
            <Link to="/dashboard/subscriptions" style={{ color: "#00bcd4", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
              Voir tout →
            </Link>
          </div>
          
          {loadingSubscriptions ? (
            <p style={{ color: "#666" }}>Chargement...</p>
          ) : subscriptions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "#666", marginBottom: "1rem" }}>Vous n'avez aucun abonnement actif.</p>
              <Link 
                to="/offre-abonnements"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  background: "#00bcd4",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  transition: "background 0.2s"
                }}
              >
                Découvrir les abonnements
              </Link>
            </div>
          ) : (
            <div>
              <div className="subscriptions-list" style={{ marginBottom: "1rem" }}>
                {subscriptions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="subscription-item">
                    <div className="subscription-info">
                      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                        {sub.teacher_name || sub.teacher_email}
                      </h3>
                      <p style={{ margin: "0.25rem 0", color: "#00bcd4", fontWeight: 600 }}>
                        {sub.type === "artist_subscription" ? "Abonnement Artiste" : "Autre Abonnement"}
                      </p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#666" }}>
                        Expire le {new Date(sub.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ color: "#4caf50", fontWeight: 600, fontSize: "0.9rem" }}>✓ Actif</span>
                  </div>
                ))}
              </div>
              {subscriptions.length > 3 && (
                <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
                  Et {subscriptions.length - 3} autre{subscriptions.length - 3 > 1 ? "s" : ""}...
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </TeacherDashboardShell>
  );
}
