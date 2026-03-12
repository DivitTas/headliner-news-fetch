import { CATEGORIES } from '../api/news';
import './CategoryFilter.css';

/**
 * Renders a row of category buttons.
 * The active category gets the .active class for cyberpunk highlight styling.
 *
 * Props:
 *   category        {string}   - currently selected category
 *   onCategoryChange {Function} - called with the new category string on select
 */
function CategoryFilter({ category, onCategoryChange }) {
  const handleKeyDown = (e, cat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCategoryChange(cat);
    }
  };

  return (
    <nav className="category-filter" aria-label="News categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`category-btn${category === cat ? ' active' : ''}`}
          onClick={() => onCategoryChange(cat)}
          onKeyDown={(e) => handleKeyDown(e, cat)}
          aria-pressed={category === cat}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}

export default CategoryFilter;
