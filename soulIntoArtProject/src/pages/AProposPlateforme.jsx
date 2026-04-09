import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useSiteContent } from "../hooks/useSiteContent";
import "./PublicPage.css";

export default function AProposPlateforme() {
  const { content } = useSiteContent(["public.about_values"]);
  const aboutValues = content["public.about_values"] || [];

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">A propos de SIA</span>
            <h1>Une plateforme creee pour transmettre la pratique artistique</h1>
            <p className="public-lead">
              Soul Into Art connecte des artistes et des apprenants autour d'une experience
              humaine, flexible et orientee progression.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <div className="public-grid public-grid-2">
            <article className="public-card">
              <div className="public-card-body">
                <h2>Notre mission</h2>
                <p>
                  Rendre l'apprentissage artistique plus accessible, plus vivant et plus simple a
                  integrer dans un quotidien charge.
                </p>
                <p className="public-inline-note">
                  Nous combinons des cours en direct, des replays et des parcours progressifs pour que
                  chacun puisse pratiquer a son rythme.
                </p>
              </div>
            </article>

            <article className="public-card">
              <div className="public-card-body">
                <h2>Nos valeurs</h2>
                <ul className="public-list">
                  {aboutValues.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="public-section public-section-alt">
        <div className="container">
          <h2>Pour qui ?</h2>
          <div className="public-grid public-grid-3">
            <article className="public-card">
              <div className="public-card-body">
                <h3>Debutants</h3>
                <p>Commencez avec des ateliers guidants et des formats accessibles.</p>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <h3>Pratiquants reguliers</h3>
                <p>Consolidez votre technique avec des programmes progressifs.</p>
              </div>
            </article>
            <article className="public-card">
              <div className="public-card-body">
                <h3>Artistes enseignants</h3>
                <p>Partagez votre pratique et developpez votre communaute d'apprenants.</p>
              </div>
            </article>
          </div>

          <div className="public-cta-box">
            <h3>Envie de nous rejoindre ?</h3>
            <p>Choisissez votre parcours et commencez votre aventure Soul Into Art.</p>
            <div className="public-inline-actions">
              <Link to="/rejoindre-communaute-sia">
                <Button variant="white" size="large">
                  Rejoindre SIA
                </Button>
              </Link>
              <Link to="/faq-contact">
                <Button variant="outline" size="large">
                  Contact & FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
