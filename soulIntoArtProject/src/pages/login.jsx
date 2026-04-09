import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      setUser(user, token);
      navigate("/dashboard/overview");
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Connexion</h1>
            <p>Bienvenue ! Connectez-vous pour continuer</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <Button type="submit" variant="primary" size="large" fullWidth disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>

            <div className="auth-divider">
              <span>ou</span>
            </div>

            <Link to="/" className="auth-link-button">
              <Button type="button" variant="outline" size="large" fullWidth>
                Retour à l'accueil
              </Button>
            </Link>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{" "}
              <Link to="/rejoindre-communaute-sia" className="auth-link">
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Demo Accounts Info */}
          <div className="demo-info">
            <h4>Comptes de démonstration</h4>
            <div className="demo-accounts">
              <div className="demo-account">
                <strong>Étudiant:</strong> user1@gmail.com / user1
              </div>
              <div className="demo-account">
                <strong>Enseignant:</strong> teacher1@gmail.com / teacher1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
