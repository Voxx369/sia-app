import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function PlaceholderPage({
  title,
  description,
  ctaTo = "/",
  ctaLabel = "Retour a l'accueil",
}) {
  return (
    <div className="courses-page">
      <div className="container" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <div
          className="empty-state"
          style={{ maxWidth: "860px", margin: "0 auto", textAlign: "left" }}
        >
          <h1 style={{ marginBottom: "16px" }}>{title}</h1>
          <p style={{ marginBottom: "24px" }}>{description}</p>
          <Link to={ctaTo}>
            <Button variant="primary" size="large">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

