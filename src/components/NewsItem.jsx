import './NewsItem.css';

function NewsItem({
  article,
  isExpanded,
  isRead,
  onToggleExpand,
  onToggleRead,
}) {
  const id = article.url || article.title;

  return (
    <article className={`news-item${isRead ? ' read' : ''}`}>
      <header className="news-item-header">
        <button
          type="button"
          className="headline-btn"
          onClick={() => onToggleExpand(id)}
          aria-expanded={isExpanded}
        >
          {article.title}
        </button>

        <button
          type="button"
          className={`read-btn${isRead ? ' active' : ''}`}
          onClick={() => onToggleRead(id)}
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
}

export default NewsItem;
