import { useSiteContent } from "../hooks/useSiteContent";
import "./PublicPage.css";

export default function LegalPage({ contentKey, fallbackTitle = "Informations legales" }) {
  const { content, loading } = useSiteContent([contentKey]);
  const legal = content[contentKey] || {};
  const title = legal.title || fallbackTitle;
  const updatedAt = legal.updatedAt || legal.updated_at;
  const sections = legal.sections || [];

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content public-hero-content-left">
            <span className="public-kicker">Informations legales</span>
            <h1>{title}</h1>
            {updatedAt && <p className="public-meta">Derniere mise a jour: {updatedAt}</p>}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          {loading ? (
            <div className="public-empty-state">Chargement...</div>
          ) : (
            <article className="public-article">
              {sections.map((section) => (
                <section key={section.heading} className="public-article-block">
                  <h2>{section.heading}</h2>
                  <p>{section.content}</p>
                </section>
              ))}
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
