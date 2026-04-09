import { useMemo, useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Toast from "../components/Toast";

const settingsTabs = [
  { to: "/dashboard/settings", label: "Profil" },
  { to: "/dashboard/settings/reset-password", label: "Mot de passe" },
  { to: "/dashboard/settings/social-profile", label: "Reseaux" },
  { to: "/dashboard/settings/withdraw-settings", label: "Retraits" },
  { to: "/dashboard/settings/billing", label: "Facturation" },
];

export default function DashboardSettings() {
  const { token, user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    displayName: user?.email?.split("@")[0] || "Artiste SIA",
    bio: "Je propose des ateliers live et replay autour de ma pratique.",
    website: "",
    instagram: "",
    paypalEmail: user?.email || "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || user?.role !== "teacher") return;
      try {
        const profileData = await api.getMyTeacherProfile();
        setTeacherProfile(profileData);
        setProfile({
          displayName: profileData.display_name || user?.email?.split("@")[0] || "Artiste SIA",
          bio: profileData.bio || "Je propose des ateliers live et replay autour de ma pratique.",
          website: "",
          instagram: "",
          paypalEmail: user?.email || "",
        });
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token, user]);

  const activeTab = useMemo(() => {
    const tab = settingsTabs.find((item) => location.pathname.startsWith(item.to));
    return tab?.label || "Profil";
  }, [location.pathname]);

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  const onSave = (event) => {
    event.preventDefault();
    setMessage("Parametres enregistres (mode demo).");
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <TeacherDashboardShell
      title="Parametres"
      subtitle="Configurez votre profil enseignant, vos retraits et vos integrations."
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <section className="teacher-panel">
        <div className="teacher-dashboard-actions">
          {settingsTabs.map((tab) => (
            <Link key={tab.to} to={tab.to}>
              <Button variant={activeTab === tab.label ? "secondary" : "outline"} size="small">
                {tab.label}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      <section className="teacher-panel">
        <h2>{activeTab}</h2>
        <form className="teacher-form-grid" onSubmit={onSave}>
          {(activeTab === "Profil" || activeTab === "Facturation") && (
            <>
              <label>
                Nom affiche
                <input
                  className="teacher-input"
                  value={profile.displayName}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </label>
              <label>
                Site web
                <input
                  className="teacher-input"
                  value={profile.website}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, website: event.target.value }))
                  }
                />
              </label>
            </>
          )}

          {activeTab === "Profil" && (
            <>
              <label>
                Bio courte
                <textarea
                  className="teacher-textarea"
                  value={profile.bio}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, bio: event.target.value }))
                  }
                />
              </label>
            </>
          )}

          {activeTab === "Reseaux" && (
            <label>
              Instagram
              <input
                className="teacher-input"
                value={profile.instagram}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, instagram: event.target.value }))
                }
                placeholder="@votrecompte"
              />
            </label>
          )}

          {activeTab === "Mot de passe" && (
            <>
              <label>
                Mot de passe actuel
                <input className="teacher-input" type="password" />
              </label>
              <label>
                Nouveau mot de passe
                <input className="teacher-input" type="password" />
              </label>
            </>
          )}

          {activeTab === "Retraits" && (
            <label>
              Email payout (PayPal)
              <input
                className="teacher-input"
                type="email"
                value={profile.paypalEmail}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, paypalEmail: event.target.value }))
                }
              />
            </label>
          )}

          {activeTab === "Facturation" && (
            <>
              <label>
                Nom de facturation
                <input className="teacher-input" placeholder="Nom ou entreprise" />
              </label>
              <label>
                Adresse
                <input className="teacher-input" placeholder="Adresse complete" />
              </label>
            </>
          )}

          <Button type="submit" variant="primary" size="medium">
            Enregistrer
          </Button>
          {message && <p>{message}</p>}
        </form>
      </section>
    </TeacherDashboardShell>
  );
}
