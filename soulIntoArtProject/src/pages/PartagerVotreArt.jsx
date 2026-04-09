import { Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";
import "./ArtistPages.css";

export default function PartagerVotreArt() {
  const { content } = useSiteContent([
    "public.share.reasons",
    "public.share.steps",
    "public.share.features",
    "public.share.faq",
  ]);

  const reasons = content["public.share.reasons"] || [];
  const steps = content["public.share.steps"] || [];
  const features = content["public.share.features"] || [];
  const shareFaq = content["public.share.faq"] || [];

  return (
    <div className="sia-partager-page">
      <section className="sia-hero">
        <div className="container">
          <div className="sia-hero-content">
            <h1>Partagez votre art. Eveillez des ames. Creez du lien.</h1>
            <p>
              Rejoignez la plateforme d'apprentissage artistique en ligne qui valorise votre pratique,
              votre singularite et votre transmission.
            </p>
            <Link to="/rejoindre-communaute-sia" className="sia-hero-button">
              Rejoindre la plateforme
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="sia-breadcrumb">
        <div className="container">
          <Link to="/">Accueil</Link>
          <span> | </span>
          <span>Partager votre art</span>
        </div>
      </div>

      <section className="sia-section">
        <div className="container">
          <h2 className="sia-section-title">
            Artistes, pourquoi rejoindre <span>SIA</span> ?
          </h2>
          <div className="sia-cards-grid">
            {reasons.map((item, index) => (
              <article key={item.title} className="sia-reason-card">
                <div className="sia-reason-icon">{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sia-section sia-section-alt">
        <div className="container">
          <h2 className="sia-section-title">
            Comment ca <span>fonctionne</span> ?
          </h2>
          <div className="sia-steps-grid">
            {steps.map((item, index) => (
              <article key={item.title} className="sia-step-card">
                <div className="sia-step-number">{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="sia-center-action">
            <Link to="/rejoindre-communaute-sia" className="sia-hero-button">
              Rejoindre la plateforme
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="sia-section">
        <div className="container">
          <h2 className="sia-section-title">
            Un ecosysteme pense pour <span>les artistes</span>
          </h2>
          <p className="sia-section-intro">
            Chez SIA, chaque outil est concu pour que vous puissiez vous concentrer sur ce qui compte
            vraiment: votre art et votre communaute.
          </p>
          <div className="sia-features-grid">
            {features.map((item) => (
              <article key={item.title} className="sia-feature-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sia-section sia-section-alt">
        <div className="container">
          <h2 className="sia-section-title">
            Questions <span>frequentes</span>
          </h2>
          <div className="sia-faq-grid">
            {shareFaq.map((item) => (
              <article className="sia-faq-item" key={item.question}>
                <h3>{item.question}</h3>
                {item.answer && <p>{item.answer}</p>}
                {Array.isArray(item.items) && item.items.length > 0 && (
                  <ul>
                    {item.items.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sia-final-cta">
        <div className="container">
          <h2>Pret.e a partager votre art avec le monde ?</h2>
          <p>Rejoignez une communaute d'artistes passionnes et commencez a inspirer.</p>
          <Link to="/rejoindre-communaute-sia" className="sia-hero-button">
            Rejoindre la plateforme
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
