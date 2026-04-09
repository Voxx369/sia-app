import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useSiteContent } from "../hooks/useSiteContent";
import "./PublicPage.css";

export default function MesRevenusArtiste() {
  const { content } = useSiteContent([
    "public.revenue.monthly_rows",
    "public.revenue.tips",
  ]);

  const monthlyRows = content["public.revenue.monthly_rows"] || [];
  const tips = content["public.revenue.tips"] || [];

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Revenus artistes</span>
            <h1>Suivez vos performances et votre evolution</h1>
            <p className="public-lead">
              Cette page presente un apercu type du suivi revenus disponible pour les artistes sur la
              plateforme.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <div className="public-grid public-grid-3">
            <article className="public-card">
              <div className="public-card-body">
                <p className="public-meta">Revenus cumules</p>
                <h3>4 050 EUR</h3>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <p className="public-meta">Sessions animees</p>
                <h3>21</h3>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <p className="public-meta">Apprenants actifs</p>
                <h3>117</h3>
              </div>
            </article>
          </div>

          <div className="public-table-wrapper">
            <table className="public-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Sessions</th>
                  <th>Apprenants</th>
                  <th>Revenus</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.sessions}</td>
                    <td>{row.learners}</td>
                    <td>{row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="public-section public-section-alt">
        <div className="container">
          <h2>Bonnes pratiques pour augmenter vos revenus</h2>
          <div className="public-grid public-grid-2">
            <article className="public-card">
              <div className="public-card-body">
                <ul className="public-list">
                  {tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <h3>Aller plus loin dans le dashboard</h3>
                <p>
                  Retrouvez les donnees detaillees (analytics, retraits, historique) dans votre espace
                  enseignant.
                </p>
                <div className="public-inline-actions">
                  <Link to="/dashboard/analytics">
                    <Button variant="secondary" size="medium">
                      Voir analytics
                    </Button>
                  </Link>
                  <Link to="/dashboard/withdraw">
                    <Button variant="primary" size="medium">
                      Gerer retraits
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
