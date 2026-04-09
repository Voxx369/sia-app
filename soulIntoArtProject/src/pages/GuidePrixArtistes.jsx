import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useSiteContent } from "../hooks/useSiteContent";
import "./PublicPage.css";

export default function GuidePrixArtistes() {
  const { content } = useSiteContent([
    "public.guide.minimum_price_rules",
    "public.guide.checklist",
    "public.guide.faq",
  ]);

  const minimumPriceRules = content["public.guide.minimum_price_rules"] || [];
  const checklist = content["public.guide.checklist"] || [];
  const guideFaq = content["public.guide.faq"] || [];

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Guide prix</span>
            <h1>Guide tarification pour artistes SIA</h1>
            <p className="public-lead">
              Cette page reprend les reperes utilises pour construire des offres lisibles, coherentes et
              durables sur Soul Into Art.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <div className="public-grid public-grid-2">
            <article className="public-card">
              <div className="public-card-body">
                <h2>Pourquoi ce prix minimum</h2>
                <ul className="public-list">
                  {minimumPriceRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <h2>Ce qui est concerne</h2>
                <ul className="public-list">
                  <li>Cours live en visioconference</li>
                  <li>Formats replay lies a vos ateliers</li>
                  <li>Parcours regulier ou ponctuel</li>
                </ul>
                <p className="public-inline-note">
                  Le but est de clarifier votre positionnement, pas de figer votre creativite.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="public-section public-section-alt">
        <div className="container">
          <h2>Checklist avant de publier un cours live</h2>
          <div className="public-grid public-grid-2">
            <article className="public-card">
              <div className="public-card-body">
                <ul className="public-list">
                  {checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <h3>Besoin d'aide sur votre grille ?</h3>
                <p>
                  L'equipe SIA peut relire votre proposition pour verifier la clarte du format et de
                  la valeur percue.
                </p>
                <div className="public-inline-actions">
                  <Link to="/faq-contact">
                    <Button variant="secondary" size="medium">
                      Contacter l'equipe
                    </Button>
                  </Link>
                  <Link to="/dashboard/teacher/courses/new">
                    <Button variant="primary" size="medium">
                      Creer un cours
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <h2>Questions frequentes</h2>
          <div className="public-grid public-grid-3">
            {guideFaq.map((item) => (
              <article className="public-card" key={item.question}>
                <div className="public-card-body">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
