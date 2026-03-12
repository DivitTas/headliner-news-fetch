import { useEffect, useMemo, useState } from 'react';
import { fetchHeadlines } from './api/news';
import CategoryFilter from './components/CategoryFilter';
import NewsList from './components/NewsList';
import './App.css';

function App() {
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
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        if (!apiKey) {
          throw new Error('Missing VITE_NEWS_API_KEY in .env or .env.local');
        }

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

    // Re-fetch when category changes; dependency array prevents infinite loops.
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
        <h1>Headliner</h1>
        <p className="tagline">Top India headlines in a matrix feed.</p>
      </header>

      <section className="controls" aria-label="News controls">
        <CategoryFilter category={category} onCategoryChange={setCategory} />

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

      {!loading && !error && (
        <NewsList
          articles={filteredArticles}
          readArticles={readArticles}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onToggleRead={handleToggleRead}
        />
      )}
    </main>
  );
}

export default App;
