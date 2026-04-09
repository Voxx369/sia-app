import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./TeacherDashboardShell.css";

const primaryMenu = [
  {
    key: "overview",
    to: "/dashboard/overview",
    label: "Tableau de bord",
    icon: "dashboard",
  },
  {
    key: "profile",
    to: "/dashboard/profile",
    label: "Mon profil",
    icon: "profile",
  },
  {
    key: "courses-student",
    to: "/dashboard/my-courses",
    label: "Cours suivis",
    icon: "courses",
    studentOnly: true,
  },
  {
    key: "subscriptions",
    to: "/dashboard/subscriptions",
    label: "Mes abonnements",
    icon: "subscriptions",
    studentOnly: true,
  },
  {
    key: "courses-teacher",
    to: "/dashboard/teacher/courses",
    label: "Mes cours",
    icon: "courses",
    teacherOnly: true,
    matchPrefix: true,
  },
  {
    key: "subscribers",
    to: "/dashboard/teacher/subscribers",
    label: "Mes abonnés",
    icon: "subscribers",
    teacherOnly: true,
  },
  {
    key: "reviews",
    to: "/dashboard/reviews",
    label: "Avis",
    icon: "reviews",
  },
  {
    key: "quiz-attempts",
    to: "/dashboard/quiz-attempts",
    label: "Mes tentatives de quiz",
    icon: "quiz",
  },
  {
    key: "wishlist",
    to: "/dashboard/wishlist",
    label: "Liste de souhaits",
    icon: "wishlist",
  },
  {
    key: "orders",
    to: "/dashboard/orders",
    label: "Historique de commande",
    icon: "orders",
  },
  {
    key: "questions",
    to: "/dashboard/questions-answers",
    label: "Questions et reponses",
    icon: "questions",
  },
  {
    key: "calendar",
    to: "/dashboard/calendar",
    label: "Calendar",
    icon: "calendar",
  },
];

const teacherSecondaryMenu = [
  {
    key: "announcements",
    to: "/dashboard/announcements",
    label: "Annonces",
    icon: "announcements",
  },
  {
    key: "analytics",
    to: "/dashboard/analytics",
    label: "Analytics",
    icon: "analytics",
  },
  {
    key: "withdraw",
    to: "/dashboard/withdraw",
    label: "Retraits",
    icon: "withdraw",
  },
  {
    key: "zoom",
    to: "/dashboard/zoom",
    label: "Zoom",
    icon: "zoom",
  },
  {
    key: "settings",
    to: "/dashboard/settings",
    label: "Reglages",
    icon: "settings",
    matchPrefix: true,
  },
];

function toDisplayName(user) {
  if (!user) return "Membre SIA";
  const explicit = user.displayName || user.name || user.fullName || user.full_name;
  if (explicit && explicit.trim()) return explicit.trim();
  const emailPrefix = (user.email || "").split("@")[0];
  if (!emailPrefix) return "Membre SIA";
  return emailPrefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toInitials(displayName) {
  const parts = displayName.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return initials || "MT";
}

function Icon({ name }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "courses":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h14a2 2 0 0 1 2 2v10H6a2 2 0 0 0-2 2V6z" stroke="currentColor" strokeWidth="2" />
          <path d="M6 20v-2a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "subscriptions":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h18M7 16h3" stroke="currentColor" strokeWidth="2" />
          <path d="M16 5v3M14 6h4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "subscribers":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "quiz":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 22h8M12 18v4M8 9h8M8 13h5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "wishlist":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "questions":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "announcements":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5L7 9H5a2 2 0 0 0-2 2z" stroke="currentColor" strokeWidth="2" />
          <path d="M16 8a4 4 0 0 1 0 8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" />
          <rect x="7" y="12" width="3" height="6" fill="currentColor" />
          <rect x="12" y="9" width="3" height="9" fill="currentColor" />
          <rect x="17" y="6" width="3" height="12" fill="currentColor" />
        </svg>
      );
    case "withdraw":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M2 10h20M7 14h3" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "zoom":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="m15 10 6-3v10l-6-3" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7.2 4l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function StarIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MenuItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={!item.matchPrefix}
      className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}
    >
      <span className="dashboard-nav-icon">
        <Icon name={item.icon} />
      </span>
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function TeacherDashboardShell({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [teacherReviewSummary, setTeacherReviewSummary] = useState({
    rating_avg: null,
    reviews_count: 0,
    loading: false,
  });
  const displayName = toDisplayName(user);
  const initials = toInitials(displayName);

  useEffect(() => {
    if (!isTeacher || !user?.id) return;

    let ignore = false;

    const load = async () => {
      setTeacherReviewSummary((current) => ({ ...current, loading: true }));
      try {
        const profile = await api.getMyTeacherProfile();
        if (ignore) return;
        setTeacherReviewSummary({
          rating_avg:
            profile?.rating_avg === null || profile?.rating_avg === undefined
              ? null
              : Number(profile.rating_avg),
          reviews_count: Number(profile?.reviews_count || 0),
          loading: false,
        });
      } catch {
        if (!ignore) {
          setTeacherReviewSummary((current) => ({ ...current, loading: false }));
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [isTeacher, user?.id]);

  const teacherRatingLabel = useMemo(() => {
    if (!isTeacher) return "Note";
    if (teacherReviewSummary.loading) return "Chargement des avis...";
    if (!teacherReviewSummary.reviews_count) return "Pas encore d'avis";
    if (teacherReviewSummary.rating_avg === null) return "Pas encore d'avis";
    return `${teacherReviewSummary.rating_avg.toFixed(1)}/5 (${teacherReviewSummary.reviews_count} avis)`;
  }, [isTeacher, teacherReviewSummary.loading, teacherReviewSummary.rating_avg, teacherReviewSummary.reviews_count]);

  const filledStars = useMemo(() => {
    if (!isTeacher) return 0;
    if (!teacherReviewSummary.reviews_count) return 0;
    if (teacherReviewSummary.rating_avg === null) return 0;
    return Math.max(0, Math.min(5, Math.round(teacherReviewSummary.rating_avg)));
  }, [isTeacher, teacherReviewSummary.rating_avg, teacherReviewSummary.reviews_count]);

  const filteredPrimaryMenu = primaryMenu.filter((item) => {
    if (item.teacherOnly) return isTeacher;
    if (item.studentOnly) return !isTeacher;
    return true;
  });

  const filteredSecondaryMenu = isTeacher ? teacherSecondaryMenu : [];

  return (
    <div className="dashboard-page">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-profile-card">
            <div className="dashboard-avatar">{initials}</div>
            <div className="dashboard-profile-text">
              <p className="dashboard-profile-name">{displayName}</p>
              <p className="dashboard-profile-role">
                {isTeacher ? "Artiste / Enseignant" : "Eleve"}
              </p>
              <div className="dashboard-profile-stars" aria-label={teacherRatingLabel}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <StarIcon key={index} filled={index < filledStars} />
                ))}
              </div>
              {isTeacher && <p className="dashboard-profile-rating">{teacherRatingLabel}</p>}
            </div>
          </div>

          <nav className="dashboard-nav" aria-label="Navigation dashboard principale">
            {filteredPrimaryMenu.map((item) => (
              <MenuItem key={item.key} item={item} />
            ))}
          </nav>

          {filteredSecondaryMenu.length > 0 && (
            <>
              <div className="dashboard-nav-divider" />
              <nav className="dashboard-nav" aria-label="Navigation dashboard enseignant">
                {filteredSecondaryMenu.map((item) => (
                  <MenuItem key={item.key} item={item} />
                ))}
              </nav>
            </>
          )}

          <div className="dashboard-nav-divider" />
          <button type="button" className="dashboard-logout-btn" onClick={logout}>
            <span className="dashboard-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" />
                <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span>Deconnexion</span>
          </button>
        </aside>

        <section className="dashboard-content">
          {(title || subtitle || actions) && (
            <header className="dashboard-content-header">
              <div>
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
              {actions && <div className="dashboard-content-actions">{actions}</div>}
            </header>
          )}
          {children}
        </section>
      </div>
    </div>
  );
}
