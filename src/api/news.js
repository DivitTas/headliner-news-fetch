const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const CATEGORIES = [
  'general',
  'business',
  'technology',
  'sports',
  'entertainment',
  'health',
  'science',
];

/**
 * Fetches top headlines from NewsAPI for India.
 * Routed through corsproxy.io to avoid CORS blocks on the free tier.
 *
 * @param {string} category - One of the CATEGORIES values
 * @returns {Promise<Array>} Array of article objects from NewsAPI
 */
async function fetchHeadlines(category = 'general') {
  const newsApiUrl =
    `https://newsapi.org/v2/top-headlines` +
    `?country=in&category=${category}&apiKey=${API_KEY}`;

  // corsproxy.io wraps the request server-side, bypassing browser CORS restrictions
  const url = `https://corsproxy.io/?${encodeURIComponent(newsApiUrl)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch headlines (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (data.status !== 'ok') {
    throw new Error(data.message || 'NewsAPI returned an error');
  }

  // Filter out articles with removed/null content (NewsAPI quirk)
  return data.articles.filter(
    (a) => a.title && a.title !== '[Removed]'
  );
}

export { fetchHeadlines, CATEGORIES };
