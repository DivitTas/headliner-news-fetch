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
 * Uses direct NewsAPI by default, then falls back to corsproxy.io
 * only when the browser blocks the request (CORS/network failure).
 *
 * @param {string} category - One of the CATEGORIES values
 * @returns {Promise<Array>} Array of article objects from NewsAPI
 */
async function fetchHeadlines(category = 'general') {
  if (!API_KEY) {
    throw new Error('Missing VITE_NEWS_API_KEY');
  }

  const newsApiUrl =
    `https://newsapi.org/v2/top-headlines` +
    `?country=in&category=${category}&apiKey=${API_KEY}`;

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

  // Filter out articles with removed/null content (NewsAPI quirk)
  return (data.articles ?? []).filter((a) => a.title && a.title !== '[Removed]');
}

export { fetchHeadlines, CATEGORIES };
