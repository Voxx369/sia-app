import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import "./PublicPage.css";

const ALL_CATEGORIES = "toutes";

export default function Blog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [posts, setPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        const result = await api.listBlogPosts({ limit: 200, offset: 0 });
        if (ignore) return;
        const categoryMap = new Map();
        (result.items || []).forEach((post) => {
          const slug = post.category?.slug;
          const name = post.category?.name;
          if (!slug || !name) return;
          categoryMap.set(slug, name);
        });
        setAllCategories(Array.from(categoryMap.entries()).map(([slug, name]) => ({ slug, name })));
      } catch (err) {
        if (!ignore) {
          console.error("Unable to load blog categories", err);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.listBlogPosts({
          q: query.trim() || undefined,
          category: category === ALL_CATEGORIES ? undefined : category,
          limit: 200,
          offset: 0,
        });
        if (!ignore) {
          setPosts(result.items || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Impossible de charger les articles");
          setPosts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [query, category]);

  const categories = useMemo(
    () => [{ slug: ALL_CATEGORIES, name: "Toutes les categories" }, ...allCategories],
    [allCategories]
  );

  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <div className="public-hero-content">
            <span className="public-kicker">Blog</span>
            <h1>Inspiration, conseils et techniques artistiques</h1>
            <p className="public-lead">
              Retrouvez nos articles pour progresser dans votre pratique et choisir les formats de cours
              adaptes a vos objectifs.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          <div className="public-blog-controls">
            <input
              className="public-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un article..."
            />
            <select
              className="public-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((current) => (
                <option value={current.slug} key={current.slug}>
                  {current.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <div className="public-empty-state">Chargement des articles...</div>}
          {error && <div className="public-empty-state">{error}</div>}

          {!loading && !error && (
            <div className="public-grid public-grid-3">
              {posts.map((post) => (
                <article className="public-card" key={post.id}>
                  <img className="public-avatar-image" src={post.cover_image_url} alt={post.title} />
                  <div className="public-card-body">
                    <p className="public-meta">{post.category?.name || "Blog"}</p>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <p className="public-meta">Par {post.author?.display_name || "Artiste"}</p>
                    <Link
                      className="public-inline-link"
                      to={`/blog/${post.category?.slug || "general"}/${post.slug}`}
                    >
                      Lire l'article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="public-empty-state">Aucun article ne correspond a votre recherche.</div>
          )}
        </div>
      </section>
    </div>
  );
}
