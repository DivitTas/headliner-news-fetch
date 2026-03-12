# Copilot Instructions — headliner

## Commands

```bash
npm run dev        # start dev server at http://localhost:5173
npm run build      # production build (output: dist/)
npm run preview    # serve production build locally
npm run lint       # run ESLint across all .js/.jsx files
```

No test runner is configured.

## Environment

Create `.env.local` in the project root before running:

```
VITE_NEWS_API_KEY=your_key_here
```

Access in code via `import.meta.env.VITE_NEWS_API_KEY`. Never hardcode the key.

## Architecture

This is a Vite + React (JavaScript, no TypeScript) single-page app.

Entry point: `index.html` → `src/main.jsx` → `src/App.jsx`

Intended modular structure (being built out):

```
src/
  api/news.js               # fetchHeadlines(category) — all API logic lives here
  components/
    CategoryFilter.jsx      # category switcher, receives category + onCategoryChange
    NewsList.jsx            # maps articles array, handles empty state
    NewsItem.jsx            # single article: expand toggle, mark-as-read
  App.jsx                   # root — owns all state, effects, and layout
  AppMinimal.jsx            # single-file self-contained variant (same features)
  index.css                 # global resets + CSS custom properties (light/dark vars)
  App.css                   # component styles, .read class, .dark overrides
```

All state lives in `App.jsx`. Components receive props; none own their own data-fetching state.

## State conventions

`App.jsx` maintains these named state variables — use exact names:

| Variable | Type | Purpose |
|---|---|---|
| `articles` | array | fetched news articles |
| `category` | string | active category |
| `readArticles` | array | article URLs marked as read; persisted to localStorage |
| `loading` | boolean | fetch in progress |
| `error` | string\|null | fetch error message |
| `expandedId` | string\|null | URL of currently expanded article |
| `darkMode` | boolean | theme toggle |
| `search` | string | client-side filter input |

## Key patterns

**API fetch:** `useEffect` with `[category]` as the dependency array triggers on mount and on every category change. Do not add other deps that would cause extra fetches.

**CORS:** NewsAPI blocks non-localhost origins on the free tier. Fetch URLs are wrapped with `https://corsproxy.io/?${encodeURIComponent(url)}` inside `src/api/news.js`.

**Keys in lists:** Use `article.url` as the React `key`. Fall back to index only if `url` is absent, and add a comment explaining why.

**Read state persistence:** `readArticles` is initialised from `localStorage` and synced back via a separate `useEffect([readArticles])`. Do not merge this into the fetch effect.

**Dark mode:** Toggle the `.dark` class on the `<html>` element. All theme differences are handled via CSS custom properties in `index.css` — no inline styles for theming.

**Keyboard accessibility:** Interactive elements that are not native `<button>` or `<a>` tags must handle `onKeyDown` for Enter and Space.

## Styling

CSS custom properties are defined on `:root` in `index.css`. Dark overrides use `@media (prefers-color-scheme: dark)` for the system preference and the `.dark` class on `<html>` for the manual toggle.

The `.read` CSS class applies `text-decoration: line-through` to mark read articles visually.

`#root` is centered, max-width 1126px, with border-inline separators.

## ESLint

Config is in `eslint.config.js` (flat config format). Rules include:
- `no-unused-vars` — uppercase-only names (e.g., constants) are exempt via `varsIgnorePattern: '^[A-Z_]'`
- `eslint-plugin-react-hooks` — enforces hooks rules
- `eslint-plugin-react-refresh` — Vite HMR compatibility

Run `npm run lint` before committing.
