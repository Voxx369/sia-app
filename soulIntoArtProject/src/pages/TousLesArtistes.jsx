import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import "./ArtistPages.css";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=Artiste+SIA&background=1A1F71&color=fff&size=256";
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=420&fit=crop";

export default function TousLesArtistes() {
  const [query, setQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadArtists = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listPublicTeachers();
        if (!ignore) {
          setArtists(data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger les artistes");
          setArtists([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadArtists();

    return () => {
      ignore = true;
    };
  }, []);

  const disciplines = useMemo(() => {
    const values = new Set();
    artists.forEach((artist) => {
      (artist.disciplines || []).forEach((discipline) => values.add(discipline));
    });
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artists.filter((artist) => {
      const artistDisciplines = artist.disciplines || [];
      const matchDiscipline =
        disciplineFilter === "all" || artistDisciplines.includes(disciplineFilter);
      if (!matchDiscipline) return false;
      if (!q) return true;

      const haystack = `${artist.display_name} ${artistDisciplines.join(" ")} ${artist.bio || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [artists, query, disciplineFilter]);

  return (
    <div className="sia-artists-page">
      <section className="sia-hero sia-hero-artists">
        <div className="container">
          <div className="sia-hero-content">
            <h1>Tous les artistes</h1>
            <p>
              Explorez les profils des artistes Soul Into Art, leurs disciplines et leurs univers
              pedagogiques.
            </p>
          </div>
        </div>
      </section>

      <section className="sia-section">
        <div className="container">
          <div className="sia-artists-controls">
            <input
              className="sia-search-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un artiste ou une discipline..."
            />
            <select
              className="sia-select-input"
              value={disciplineFilter}
              onChange={(event) => setDisciplineFilter(event.target.value)}
            >
              {disciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline === "all" ? "Toutes les disciplines" : discipline}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="sia-empty-results">Chargement des artistes...</div>}
          {error && <div className="sia-empty-results">{error}</div>}

          {!loading && !error && (
            <div className="sia-artists-grid">
              {filteredArtists.map((artist) => {
                const coursesSummary = `${artist.courses_count || 0} cours  \u2022  ${artist.learners_count || 0} apprenants`;
                return (
                  <article className="sia-instructor-card" key={artist.user_id}>
                    <div
                      className="sia-card-cover"
                      style={{ backgroundImage: `url(${artist.cover_url || FALLBACK_COVER})` }}
                    >
                      <img
                        src={artist.avatar_url || FALLBACK_AVATAR}
                        alt={artist.display_name}
                        className="sia-card-avatar"
                      />
                    </div>

                    <div className="sia-card-content">
                      <h3 className="sia-card-name">{artist.display_name}</h3>
                      <p className="sia-card-courses">{coursesSummary}</p>

                      <div className="sia-card-disciplines">
                        {(artist.disciplines || []).map((discipline) => (
                          <span className="sia-discipline-tag" key={`${artist.user_id}-${discipline}`}>
                            {discipline}
                          </span>
                        ))}
                      </div>

                      <div className="sia-card-country">{artist.country_code || "FR"}</div>

                      <Link to={`/tous-les-artistes/${artist.profile_slug}`} className="sia-card-link">
                        Decouvrir
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredArtists.length === 0 && (
            <div className="sia-empty-results">Aucun artiste ne correspond a votre recherche.</div>
          )}
        </div>
      </section>
    </div>
  );
}
