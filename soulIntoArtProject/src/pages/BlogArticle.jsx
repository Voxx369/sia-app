import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/Button";
import { api } from "../api/client";
import "./PublicPage.css";

function buildArticleBlocks(post) {
  if (!post) return [];
  return [
    {
      title: "Pourquoi ce sujet est important",
      text: post.excerpt,
    },
    {
      title: "Comment l'appliquer a votre pratique",
      text:
        "Choisissez un objectif simple sur 2 semaines, puis planifiez des sessions courtes mais regulieres. La constance donne de meilleurs resultats qu'une pratique ponctuelle intense.",
    },
    {
      title: "Prochaine etape",
      text:
        "Passez a l'action avec un cours live ou replay de la meme discipline afin de transformer la theorie en progression concrete.",
    },
  ];
}

export default function BlogArticle() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const currentPost = await api.getBlogPostBySlug(slug);
        if (ignore) return;

        setPost(currentPost);

        const sameCategory = await api.listBlogPosts({
          category: currentPost.category?.slug,
          limit: 6,
          offset: 0,
        });

        if (!ignore) {
          setRelatedPosts(
            (sameCategory.items || [])
              .filter((item) => item.slug !== currentPost.slug)
              .slice(0, 3)
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Article introuvable");
          setPost(null);
          setRelatedPosts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      load();
    }

    return () => {
      ignore = true;
    };
  }, [slug]);

  const blocks = useMemo(() => buildArticleBlocks(post), [post]);

  if (loading) {
    return (
      <div className="public-page">
        <section className="public-section">
          <div className="container">
            <div className="public-empty-state">Chargement de l'article...</div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="public-page">
        <section className="public-section">
          <div className="container">
            <div className="public-empty-state">
              Article introuvable. Revenez au blog pour continuer votre lecture.
            </div>
            <Link to="/blog">
              <Button variant="primary" size="medium">
                Retour au blog
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content public-hero-content-left">
            <p className="public-meta">Categorie: {post.category?.name}</p>
            <h1>{post.title}</h1>
            <p className="public-lead">{post.excerpt}</p>
            <p className="public-meta">Par {post.author?.display_name || "Artiste"}</p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <img className="public-article-cover" src={post.cover_image_url} alt={post.title} />
          <article className="public-article">
            {blocks.map((block) => (
              <section key={block.title} className="public-article-block">
                <h2>{block.title}</h2>
                <p>{block.text}</p>
              </section>
            ))}
            {post.content_md && (
              <section className="public-article-block">
                <h2>Contenu</h2>
                <p>{post.content_md}</p>
              </section>
            )}
          </article>

          <div className="public-inline-actions">
            <Link to="/tous-les-cours-en-ligne">
              <Button variant="secondary" size="medium">
                Voir les cours
              </Button>
            </Link>
            <Link to="/blog">
              <Button variant="outline" size="medium">
                Retour au blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="public-section public-section-alt">
          <div className="container">
            <h2>Articles lies</h2>
            <div className="public-grid public-grid-3">
              {relatedPosts.map((related) => (
                <article key={related.id} className="public-card">
                  <img className="public-avatar-image" src={related.cover_image_url} alt={related.title} />
                  <div className="public-card-body">
                    <p className="public-meta">{related.category?.name}</p>
                    <h3>{related.title}</h3>
                    <p>{related.excerpt}</p>
                    <Link
                      className="public-inline-link"
                      to={`/blog/${related.category?.slug || "general"}/${related.slug}`}
                    >
                      Ouvrir
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
