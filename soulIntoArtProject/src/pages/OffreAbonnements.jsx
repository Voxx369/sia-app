import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Toast from "../components/Toast";
import { api } from "../api/client";
import "./PublicPage.css";
import "./OffreAbonnements.css";

export default function OffreAbonnements() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [teachers, setTeachers] = useState([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Rediriger les professeurs vers leur page d'abonnés
  if (user && user.role === 'teacher') {
    return <Navigate to="/dashboard/teacher/subscribers" replace />;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, typesData] = await Promise.all([
          api.listPublicTeachers({ subscription_enabled: true }),
          api.getSubscriptionTypes(),
        ]);
        setTeachers(teachersData);
        setSubscriptionTypes(typesData);
        
        // Pré-sélectionner le prof si passé dans l'URL
        const teacherParam = searchParams.get('teacher');
        if (teacherParam) {
          setSelectedTeacherId(teacherParam);
        }
      } catch (error) {
        setToast({ type: "error", message: error.message });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  const handleSubscribe = async () => {
    if (!token) {
      navigate("/dashboard");
      return;
    }

    if (!selectedType) {
      setToast({ type: "error", message: "Veuillez sélectionner un type d'abonnement" });
      return;
    }

    if (selectedType === 'artist_subscription' && !selectedTeacherId) {
      setToast({ type: "error", message: "Veuillez sélectionner un professeur" });
      return;
    }

    setSubmitting(true);
    try {
      const subscriptionData = {
        type: selectedType,
      };
      
      if (selectedType === 'artist_subscription') {
        subscriptionData.teacher_id = parseInt(selectedTeacherId);
      }
      
      const newSub = await api.createSubscription(subscriptionData);
      console.log('✅ Abonnement créé:', newSub);
      setToast({ type: "success", message: "Abonnement créé avec succès !" });
      setTimeout(() => {
        console.log('🔄 Redirection vers /dashboard/subscriptions');
        navigate("/dashboard/subscriptions", { state: { refresh: true } });
      }, 2000);
    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
      setToast({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeacher = teachers.find(t => t.user_id === parseInt(selectedTeacherId));

  if (loading) {
    return (
      <div className="public-page">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Abonnements SIA</span>
            <h1>Abonnez-vous à vos artistes préférés</h1>
            <p className="public-lead">
              Accédez au contenu complet de vos professeurs favoris ou uniquement à leurs replays.
              Choisissez la formule qui vous correspond.
            </p>
          </div>
        </div>
      </section>

      {selectedType === 'artist_subscription' && (
        <section className="public-section">
          <div className="container">
            <h2>1. Sélectionnez votre professeur</h2>
            <p className="public-section-intro">
              Choisissez l'artiste que vous souhaitez suivre avec votre abonnement.
            </p>
            
            {teachers.length === 0 ? (
              <p>Aucun professeur disponible pour le moment.</p>
            ) : (
              <div className="teacher-selector">
                <select 
                  className="teacher-select"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">-- Choisissez un professeur --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.user_id} value={teacher.user_id}>
                      {teacher.display_name || teacher.email} 
                      {teacher.disciplines && teacher.disciplines.length > 0 && ` - ${teacher.disciplines.join(", ")}`}
                    </option>
                  ))}
                </select>
              
              {selectedTeacher && (
                <div className="selected-teacher-info">
                  <h3>{selectedTeacher.display_name || selectedTeacher.email}</h3>
                  {selectedTeacher.disciplines && selectedTeacher.disciplines.length > 0 && (
                    <p className="teacher-disciplines">{selectedTeacher.disciplines.join(", ")}</p>
                  )}
                  {selectedTeacher.bio && <p className="teacher-bio">{selectedTeacher.bio}</p>}
                  {selectedTeacher.profile_slug && (
                    <Link 
                      to={`/tous-les-artistes/${selectedTeacher.profile_slug}`}
                      className="teacher-profile-link"
                    >
                      Voir le profil complet →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      )}

      <section className="public-section public-section-alt">
        <div className="container">
          <h2>2. Choisissez votre formule</h2>
          <div className="subscription-types-grid">
            {subscriptionTypes && Object.entries(subscriptionTypes).map(([key, type]) => (
              <article
                key={key}
                className={`subscription-type-card ${selectedType === key ? 'selected' : ''}`}
                onClick={() => setSelectedType(key)}
              >
                <div className="subscription-type-badge">{type.name}</div>
                <div className="subscription-type-price">{type.price_display}/mois</div>
                <p className="subscription-type-description">{type.description}</p>
                {selectedType === key && (
                  <div className="subscription-type-selected-badge">✓ Sélectionné</div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {user && selectedType && (selectedType === 'other_subscription' || selectedTeacher) && (
        <section className="public-section">
          <div className="container">
            <div className="subscription-summary">
              <h2>Résumé de votre abonnement</h2>
              <div className="summary-details">
                {selectedType === 'artist_subscription' && selectedTeacher && (
                  <p><strong>Professeur :</strong> {selectedTeacher.display_name || selectedTeacher.email}</p>
                )}
                <p><strong>Formule :</strong> {subscriptionTypes[selectedType].name}</p>
                <p><strong>Prix :</strong> {subscriptionTypes[selectedType].price_display}/mois</p>
              </div>
              <Button
                variant="primary"
                size="large"
                onClick={handleSubscribe}
                disabled={submitting}
              >
                {submitting ? "Création en cours..." : "Confirmer l'abonnement"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {!user && (
        <section className="public-section">
          <div className="container">
            <div className="public-cta-box">
              <h3>Connectez-vous pour vous abonner</h3>
              <p>Vous devez être connecté pour créer un abonnement.</p>
              <Link to="/dashboard">
                <Button variant="white" size="large">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
