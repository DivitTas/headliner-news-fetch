# Headliner — News Headlines Reader

A React app that fetches and displays top news headlines from [NewsAPI](https://newsapi.org), built with Vite.

---

## Features

- Browse top headlines by category (general, business, technology, sports, entertainment, health, science)
- Expand/collapse article descriptions
- Mark articles as read (persisted to localStorage)
- Dark mode toggle
- Client-side search filter
- Read counter

---

## Prerequisites

- Node.js 18 or later
- A free API key from [https://newsapi.org](https://newsapi.org)

---

## Setup

1. Clone or download the repository.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root:

   ```
   VITE_NEWS_API_KEY=your_api_key_here
   ```

   The app reads the key via `import.meta.env.VITE_NEWS_API_KEY`. Never commit this file — it is already excluded by `.gitignore`.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for production

```bash
npm run build
npm run preview
```

---

## CORS

NewsAPI blocks direct browser requests from non-localhost origins (free tier restriction). The app works fine on `localhost:5173` during development. If you deploy it or run into CORS errors, requests are automatically routed through [corsproxy.io](https://corsproxy.io).

If you prefer a self-hosted proxy, here is a minimal Node/Express example:

```js
// proxy.js  —  run with: node proxy.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use('/api/news', createProxyMiddleware({
  target: 'https://newsapi.org',
  changeOrigin: true,
  pathRewrite: { '^/api/news': '/v2' },
}));

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));
```

Then update `src/api/news.js` to point to `http://localhost:3001/api/news/...` instead of the NewsAPI URL.

---

## Project structure

```
src/
  api/
    news.js               # fetchHeadlines(category) — API call logic
  components/
    CategoryFilter.jsx    # Category selector
    NewsList.jsx          # Article list with empty-state handling
    NewsItem.jsx          # Single article row (expand, mark as read)
  App.jsx                 # Root component — state, effects, layout
  AppMinimal.jsx          # Single-file version with all features inlined
  App.css                 # App-specific styles
  index.css               # Global resets and CSS custom properties
.env.example              # Template for required environment variables
```

---

## Rubric mapping

| Requirement | Implementation |
|---|---|
| API integration | `src/api/news.js` — `useEffect` fetches on mount and on `category` change |
| State management | `useState` for `articles`, `category`, `readArticles`, `loading`, `error`, `expandedId`, `darkMode`, `search` |
| Interactivity | Category filter, expand toggle, mark as read, dark mode, search box |
| Conditional rendering | Loading spinner, error message, empty-state message, expanded description |
| UI clarity | Dark mode, read counter, `line-through` on read articles, responsive layout |
| Readability | Comments on `useEffect` deps and `key` usage; modular file structure |
