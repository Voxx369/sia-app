import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

function splitName(user) {
  const rawName = user?.displayName || user?.name || user?.fullName || user?.full_name;
  if (rawName) {
    const parts = rawName.trim().split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
    };
  }

  const emailPrefix = (user?.email || "").split("@")[0];
  const normalized = emailPrefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1));

  return {
    firstName: normalized[0] || "",
    lastName: normalized.slice(1).join(" "),
  };
}

export default function DashboardProfile() {
  const { token, user } = useAuth();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const initialForm = useMemo(() => {
    const names = splitName(user);
    const username = (user?.email || "membre.sia").split("@")[0];

    return {
      firstName: names.firstName,
      lastName: names.lastName,
      username,
      email: user?.email || "",
      phone: "",
      role: user?.role === "teacher" ? "Artiste / Enseignant" : "Eleve",
      bio:
        user?.role === "teacher"
          ? "Je partage mes techniques artistiques sur Soul Into Art."
          : "Je developpe ma pratique artistique avec des cours en ligne.",
    };
  }, [user]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!token || user?.role !== "teacher") return;

    let ignore = false;

    const loadTeacherProfile = async () => {
      setLoadingProfile(true);
      setError("");
      try {
        const profile = await api.getMyTeacherProfile();
        if (ignore) return;

        const nameParts = (profile.display_name || "").trim().split(/\s+/).filter(Boolean);
        setForm((current) => ({
          ...current,
          firstName: nameParts[0] || current.firstName,
          lastName: nameParts.slice(1).join(" "),
          bio: profile.bio || current.bio,
        }));
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger le profil enseignant");
        }
      } finally {
        if (!ignore) {
          setLoadingProfile(false);
        }
      }
    };

    loadTeacherProfile();

    return () => {
      ignore = true;
    };
  }, [token, user?.role]);

  if (!token) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (user?.role === "teacher") {
      try {
        await api.updateMyTeacherProfile({
          display_name: `${form.firstName} ${form.lastName}`.trim(),
          bio: form.bio,
        });
        setNote("Profil enseignant enregistre.");
      } catch (err) {
        setError(err.message || "Impossible d'enregistrer le profil");
      }
    } else {
      setNote("Profil enregistre (mode demo eleve).");
    }

    setTimeout(() => setNote(""), 2500);
  };

  return (
    <TeacherDashboardShell
      title="Mon profil"
      subtitle="Mettez a jour vos informations personnelles et votre presentation."
    >
      {error && <section className="teacher-panel dashboard-error">{error}</section>}
      {loadingProfile && <section className="teacher-panel">Chargement du profil...</section>}

      <section className="teacher-panel">
        <form className="teacher-form-grid dashboard-profile-grid" onSubmit={onSubmit}>
          <label>
            Prenom
            <input
              className="teacher-input"
              value={form.firstName}
              onChange={(event) =>
                setForm((current) => ({ ...current, firstName: event.target.value }))
              }
            />
          </label>
          <label>
            Nom
            <input
              className="teacher-input"
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({ ...current, lastName: event.target.value }))
              }
            />
          </label>
          <label>
            Identifiant
            <input
              className="teacher-input"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
            />
          </label>
          <label>
            E-mail
            <input
              className="teacher-input"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label>
            Numero de telephone
            <input
              className="teacher-input"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+33 ..."
            />
          </label>
          <label>
            Statut
            <input className="teacher-input" value={form.role} disabled />
          </label>
          <label className="dashboard-profile-full">
            Biographie
            <textarea
              className="teacher-textarea"
              value={form.bio}
              onChange={(event) =>
                setForm((current) => ({ ...current, bio: event.target.value }))
              }
            />
          </label>

          <Button type="submit" variant="primary" size="medium">
            Enregistrer
          </Button>
          {note && <p className="dashboard-note">{note}</p>}
        </form>
      </section>
    </TeacherDashboardShell>
  );
}
