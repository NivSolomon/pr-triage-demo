import { tagCounts } from "../../src/tags.js";

/** Row of tag chips. Clicking the active chip (or "all") clears the filter. */
export default function TagFilter({ tasks, active, onChange }) {
  const tags = tagCounts(tasks);
  if (tags.length === 0) return null;

  return (
    <nav className="tag-filter" aria-label="Filter by tag">
      <button type="button" className={`chip${active ? "" : " active"}`} onClick={() => onChange("")}>
        all
      </button>
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          type="button"
          className={`chip${active === tag ? " active" : ""}`}
          onClick={() => onChange(active === tag ? "" : tag)}
        >
          #{tag} <span className="chip-count">{count}</span>
        </button>
      ))}
    </nav>
  );
}
