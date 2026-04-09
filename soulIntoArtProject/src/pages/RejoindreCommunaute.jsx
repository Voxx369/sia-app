import { Link } from "react-router-dom";
import Button from "../components/Button";
import "./PublicPage.css";

export default function RejoindreCommunaute() {
  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Communaute SIA</span>
            <h1>Plongez dans l'univers de Soul Into Art</h1>
            <p className="public-lead">
              Choisissez votre parcours: apprendre avec des artistes inspires ou partager votre art et
              transmettre votre savoir.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <div className="public-grid public-grid-2">
            <article className="public-card public-join-card">
              <div className="public-card-body">
                <span className="public-pill">Je suis apprenant.e</span>
                <h2>Suivre des cours en visio et replay</h2>
                <p>
                  Accedez a des ateliers en petit groupe, explorez plusieurs disciplines et progressez a
                  votre rythme.
                </p>
                <div className="public-join-card-cta">
                  <Link to="/student-registration">
                    <Button variant="primary" size="large">
                      Creer mon compte apprenant
                    </Button>
                  </Link>
                </div>
              </div>
            </article>

            <article className="public-card public-join-card">
              <div className="public-card-body">
                <span className="public-pill">Je suis artiste</span>
                <h2>Partager vos cours et developper votre communaute</h2>
                <p>
                  Publiez vos contenus, animez des sessions et suivez vos performances depuis votre
                  dashboard enseignant.
                </p>
                <div className="public-join-card-cta">
                  <Link to="/instructor-registration">
                    <Button variant="primary" size="large">
                      Creer mon compte artiste
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
