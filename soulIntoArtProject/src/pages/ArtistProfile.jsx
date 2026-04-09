import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import CourseCard from "../components/CourseCard";
import "./ArtistPages.css";
import "./ArtistProfile.css";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=Artiste+SIA&background=1A1F71&color=fff&size=256";
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=520&fit=crop";

export default function ArtistProfile() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [teachers, allCourses] = await Promise.all([
          api.listPublicTeachers(),
          api.listCourses(),
        ]);

        const found = (teachers || []).find((teacher) => teacher.profile_slug === slug);
        if (!found) {
          if (!ignore) {
            setArtist(null);
            setCourses([]);
            setError("Artiste introuvable.");
          }
          return;
        }

        const teacherCourses = (allCourses || []).filter(
          (course) => Number(course.teacher_id) === Number(found.user_id)
        );

        if (!ignore) {
          setArtist(found);
          setCourses(teacherCourses);
        }
      } catch (err) {
        if (!ignore) {
          setArtist(null);
          setCourses([]);
          setError(err.message || "Impossible de charger l'artiste");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const disciplines = useMemo(
    () => (artist?.disciplines || []).map((d) => String(d || "").trim()).filter(Boolean),
    [artist]
  );

  const heroStyle = useMemo(
    () => ({ backgroundImage: `url(${artist?.cover_url || FALLBACK_COVER})` }),
    [artist]
  );

  return (
    <div className="sia-artist-profile-page">
      <div className="sia-breadcrumb">
        <div className="container">
          <Link to="/tous-les-artistes">Tous les artistes</Link>
          <span>/</span>
          <span>{artist?.display_name || "Artiste"}</span>
        </div>
      </div>

      <section className="sia-hero sia-hero-artist-profile" style={heroStyle}>
        <div className="container">
          {loading ? (
            <div className="sia-empty-results sia-artist-profile-loading">
              Chargement de l'artiste...
            </div>
          ) : error ? (
            <div className="sia-empty-results">
              {error}
              <div className="sia-artist-profile-actions">
                <Link to="/tous-les-artistes" className="sia-card-link">
                  Retour a la liste
                </Link>
              </div>
            </div>
          ) : (
            <div className="sia-artist-profile-hero">
              <img
                src={artist.avatar_url || FALLBACK_AVATAR}
                alt={artist.display_name}
                className="sia-artist-profile-avatar"
              />
              <div className="sia-artist-profile-hero-text">
                <h1>{artist.display_name}</h1>
                <p className="sia-artist-profile-meta">
                  {Number(artist.courses_count || 0)} cours {"\u2022"}{" "}
                  {Number(artist.learners_count || 0)} apprenants {"\u2022"}{" "}
                  {artist.country_code || "FR"}
                </p>

                <p className="sia-artist-profile-bio">
                  {artist.bio ? artist.bio : "Bio a completer."}
                </p>

                {disciplines.length > 0 && (
                  <div className="sia-card-disciplines sia-artist-profile-disciplines">
                    {disciplines.map((discipline) => (
                      <span
                        className="sia-discipline-tag"
                        key={`${artist.user_id}-${discipline}`}
                      >
                        {discipline}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && !error && artist && (
        <section className="sia-section">
          <div className="container">
            <h2 className="sia-section-title">
              Les cours de <span>{artist.display_name}</span>
            </h2>

            {courses.length === 0 ? (
              <div className="sia-empty-results">Aucun cours disponible pour le moment.</div>
            ) : (
              <div className="sia-artist-profile-courses">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} compact />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
