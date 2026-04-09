import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useSiteContent } from "../hooks/useSiteContent";
import "./PublicPage.css";

export default function FaqContact() {
  const { content } = useSiteContent(["public.contact_faqs", "public.contact_methods"]);
  const contactFaqs = content["public.contact_faqs"] || [];
  const contactMethods = content["public.contact_methods"] || [];

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Contact et FAQ</span>
            <h1>Une question ? On vous repond rapidement</h1>
            <p className="public-lead">
              Retrouvez les reponses aux demandes les plus frequentes, puis contactez l'equipe
              SIA si besoin.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <h2>Questions frequentes</h2>
          <div className="public-grid public-grid-2">
            {contactFaqs.map((faq) => (
              <article key={faq.id || faq.question} className="public-card">
                <div className="public-card-body">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section-alt">
        <div className="container">
          <h2>Nous contacter</h2>
          <div className="public-contact-cards">
            {contactMethods.map((method) => (
              <article key={method.title} className="public-contact-card">
                <h3>{method.title}</h3>
                <p className="public-contact-main">{method.detail}</p>
                <p>{method.note}</p>
              </article>
            ))}
          </div>
          <div className="public-inline-actions">
            <Link to="/partager-votre-art">
              <Button variant="secondary" size="medium">
                Espace artistes
              </Button>
            </Link>
            <Link to="/tous-les-cours-en-ligne">
              <Button variant="primary" size="medium">
                Voir les cours
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
