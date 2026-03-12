import { useEffect, useMemo, useState } from 'react';
import './App.css';
import './components/CategoryFilter.css';
import './components/NewsList.css';
import './components/NewsItem.css';

const CATEGORIES = [
  'general',
  'business',
  'technology',
  'sports',
  'entertainment',
  'health',
  'science',
];

const CATEGORY_QUERY = {
  general: 'world news',
  business: 'business',
  technology: 'technology',
  sports: 'sports',
  entertainment: 'entertainment',
  health: 'health',
  science: 'science',
};

async function fetchHeadlines(category = 'general') {
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  if (!API_KEY) {
    throw new Error('Missing VITE_NEWS_API_KEY');
  }

  const query = CATEGORY_QUERY[category] || CATEGORY_QUERY.general;
  const newsApiUrl =
    `https://newsapi.org/v2/everything` +
    `?q=${encodeURIComponent(query)}` +
    `&language=en` +
    `&sortBy=publishedAt` +
    `&pageSize=30` +
    `&apiKey=${API_KEY}`;

  let data;
  try {
    const response = await fetch(newsApiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch headlines (HTTP ${response.status})`);
    }
    data = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const isCorsOrNetworkFailure =
      error instanceof TypeError || /failed to fetch|network|cors/i.test(message);

    if (!isCorsOrNetworkFailure) {
      throw error;
    }

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(newsApiUrl)}`;
    const proxyResponse = await fetch(proxyUrl);
    if (!proxyResponse.ok) {
      throw new Error(`Failed to fetch headlines (HTTP ${proxyResponse.status})`);
    }
    data = await proxyResponse.json();
  }

  if (data.status !== 'ok') {
    throw new Error(data.message || 'NewsAPI returned an error');
  }

  return (data.articles ?? []).filter((a) => a.title && a.title !== '[Removed]');
}

function AppMinimal() {
  // Minimal variant: same features as modular app, in a single file.
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('general');
  const [readArticles, setReadArticles] = useState(() => {
    const saved = localStorage.getItem('readArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchHeadlines(category);
        setArticles(data);
        setExpandedId(null);
      } catch (err) {
        setError(err.message || 'Failed to load news headlines');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch on mount and whenever category changes; [category] avoids infinite loops.
    loadNews();
  }, [category]);

  useEffect(() => {
    localStorage.setItem('readArticles', JSON.stringify(readArticles));
  }, [readArticles]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    return () => document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return articles;
    }

    return articles.filter((article) => {
      const haystack = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [articles, search]);

  const handleToggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleRead = (id) => {
    setReadArticles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Headliner Minimal</h1>
        <p className="tagline">Single-file global headlines reader.</p>
      </header>

      <section className="controls" aria-label="News controls">
        <nav className="category-filter" aria-label="News categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-btn${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="toolbar">
          <label className="search-box">
            <span className="sr-only">Search headlines</span>
            <input
              type="search"
              placeholder="Filter headlines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="toggle-theme"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-pressed={darkMode}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </section>

      <p className="read-count">Articles read: {readArticles.length}</p>

      {loading && (
        <p className="status" role="status">
          Loading headlines...
        </p>
      )}

      {error && !loading && (
        <p className="status error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && !filteredArticles.length && (
        <p className="news-empty" role="status">
          No articles found for this category.
        </p>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <section className="news-list" aria-live="polite">
          {filteredArticles.map((article, index) => {
            const id = article.url || article.title || `article-${index}`;
            const isRead = readArticles.includes(id);
            const isExpanded = expandedId === id;

            return (
              <article key={article.url || `${article.title}-${index}`} className={`news-item${isRead ? ' read' : ''}`}>
                {/* Prefer article.url for keys; fallback only when url is missing. */}
                <header className="news-item-header">
                  <button
                    type="button"
                    className="headline-btn"
                    onClick={() => handleToggleExpand(id)}
                    aria-expanded={isExpanded}
                  >
                    {article.title}
                  </button>

                  <button
                    type="button"
                    className={`read-btn${isRead ? ' active' : ''}`}
                    onClick={() => handleToggleRead(id)}
                    aria-pressed={isRead}
                  >
                    {isRead ? 'Mark Unread' : 'Mark as Read'}
                  </button>
                </header>

                <p className="meta">
                  <span>{article.source?.name || 'Unknown source'}</span>
                  <span>{article.author || 'Unknown author'}</span>
                </p>

                {isExpanded && (
                  <p className="description">
                    {article.description || 'No description available for this article.'}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default AppMinimal;
