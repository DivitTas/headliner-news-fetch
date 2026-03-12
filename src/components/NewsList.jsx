import NewsItem from './NewsItem';
import './NewsList.css';

function NewsList({
  articles,
  readArticles,
  expandedId,
  onToggleExpand,
  onToggleRead,
}) {
  if (!articles.length) {
    return (
      <p className="news-empty" role="status">
        No articles found for this category.
      </p>
    );
  }

  return (
    <section className="news-list" aria-live="polite">
      {articles.map((article, index) => {
        const id = article.url || article.title || `article-${index}`;
        const isRead = readArticles.includes(id);
        const isExpanded = expandedId === id;

        return (
          <NewsItem
            // Prefer article.url as key; fallback only when url is unavailable.
            key={article.url || `${article.title}-${index}`}
            article={article}
            isExpanded={isExpanded}
            isRead={isRead}
            onToggleExpand={onToggleExpand}
            onToggleRead={onToggleRead}
          />
        );
      })}
    </section>
  );
}

export default NewsList;
