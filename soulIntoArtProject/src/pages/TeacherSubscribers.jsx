import { useState, useEffect } from "react";
import { api } from "../api/client";
import Toast from "../components/Toast";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import "./TeacherSubscribers.css";

export default function TeacherSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('artist_subscription');
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    loadSubscribers();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await api.getMyTeacherProfile();
      setTeacherProfile(profileData);
      setSubscriptionEnabled(profileData.subscription_enabled || false);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const loadSubscribers = async () => {
    try {
      const data = await api.getMySubscribers();
      setSubscribers(data);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async () => {
    try {
      const newValue = !subscriptionEnabled;
      await api.updateSubscriptionEnabled(newValue);
      setSubscriptionEnabled(newValue);
      setToast({ 
        type: "success", 
        message: newValue 
          ? "Abonnements activés ! Vous apparaissez maintenant dans la liste." 
          : "Abonnements désactivés. Vous n'apparaissez plus dans la liste."
      });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  // Grouper les abonnés par type
  const artistSubscribers = subscribers.filter(s => s.type === 'artist_subscription');
  const otherSubscribers = subscribers.filter(s => s.type === 'other_subscription');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPrice = (priceCents) => {
    return `${(priceCents / 100).toFixed(2)} €`;
  };

  const SubscriberCard = ({ subscriber }) => (
    <div className="subscriber-card">
      <div className="subscriber-info">
        <div className="subscriber-avatar">
          {subscriber.student_email.charAt(0).toUpperCase()}
        </div>
        <div className="subscriber-details">
          <h4>{subscriber.student_email}</h4>
          <p className="subscriber-meta">
            Depuis le {formatDate(subscriber.start_date)}
          </p>
          <p className="subscriber-meta">
            Expire le {formatDate(subscriber.end_date)}
          </p>
        </div>
      </div>
      <div className="subscriber-price">
        {formatPrice(subscriber.price_cents)}
        <span className="price-period">/mois</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <TeacherDashboardShell title="Mes Abonnés" subtitle="Gérez vos abonnés et leurs accès">
        <p>Chargement...</p>
      </TeacherDashboardShell>
    );
  }

  return (
    <TeacherDashboardShell 
      title="Mes Abonnés" 
      subtitle={`${subscribers.length} abonné${subscribers.length > 1 ? 's' : ''} actif${subscribers.length > 1 ? 's' : ''}`}
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Section activation/désactivation des abonnements */}
      <div style={{ 
        padding: "1.5rem", 
        background: "#f8f9fa", 
        borderRadius: "8px",
        marginBottom: "2rem"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Abonnements étudiants
        </h3>
        <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Activez cette option pour permettre aux élèves de s'abonner à vos cours (39,99€/mois). 
          Les abonnés bénéficient de 2 cours gratuits par mois et de l'accès à tous vos replays.
        </p>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.75rem",
          cursor: "pointer",
          userSelect: "none"
        }}>
          <input
            type="checkbox"
            checked={subscriptionEnabled}
            onChange={handleToggleSubscription}
            style={{ 
              width: "20px", 
              height: "20px",
              cursor: "pointer"
            }}
          />
          <span style={{ fontWeight: subscriptionEnabled ? 600 : 400 }}>
            {subscriptionEnabled 
              ? "✓ Abonnements activés - Vous apparaissez dans la liste" 
              : "Abonnements désactivés"
            }
          </span>
        </label>
      </div>
      
      {/* Tabs */}
      <div className="subscribers-tabs">
        <button
          className={`tab-button ${activeTab === 'artist_subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('artist_subscription')}
        >
          <span className="tab-icon">🎨</span>
          <span className="tab-label">Abonnement Artiste</span>
          <span className="tab-badge">{artistSubscribers.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'other_subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('other_subscription')}
        >
          <span className="tab-icon">💫</span>
          <span className="tab-label">Autre Abonnement</span>
          <span className="tab-badge">{otherSubscribers.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'artist_subscription' ? (
          <div className="subscription-type-section">
            <p className="section-description">
              Ces élèves ont accès à 2 cours gratuits par mois et à tous vos replays (39,99€/mois)
            </p>
            {artistSubscribers.length === 0 ? (
              <div className="empty-state">
                <p>Aucun abonné à l'abonnement artiste pour le moment</p>
              </div>
            ) : (
              <div className="subscribers-list">
                {artistSubscribers.map((sub) => (
                  <SubscriberCard key={sub.id} subscriber={sub} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="subscription-type-section">
            <p className="section-description">
              Autre abonnement (à venir)
            </p>
            {otherSubscribers.length === 0 ? (
              <div className="empty-state">
                <p>Aucun abonné pour le moment</p>
              </div>
            ) : (
              <div className="subscribers-list">
                {otherSubscribers.map((sub) => (
                  <SubscriberCard key={sub.id} subscriber={sub} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherDashboardShell>
  );
}
