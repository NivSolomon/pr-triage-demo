export const MAX_TAGS = 5;

/**
 * Normalize user input into a clean tag list.
 * Accepts an array or a comma/space separated string ("#Work, home urgent").
 * Tags are lower-cased, stripped of a leading "#", de-duplicated and capped at MAX_TAGS.
 */
export function normalizeTags(input) {
  const raw = Array.isArray(input) ? input : String(input ?? "").split(/[\s,]+/);
  const seen = new Set();
  for (const item of raw) {
    const tag = String(item).trim().replace(/^#+/, "").toLowerCase();
    if (tag) seen.add(tag);
  }
  const tags = [...seen];
  if (tags.length > MAX_TAGS) throw new Error(`a task can have at most ${MAX_TAGS} tags`);
  return tags;
}

/** Tasks that carry the given tag. An empty tag returns every task. */
export function filterByTag(tasks, tag) {
  if (!tag) return tasks;
  return tasks.filter((t) => (t.tags ?? []).includes(tag));
}

/** All tags in use with their counts, most used first (ties alphabetical). */
export function tagCounts(tasks) {
  const counts = new Map();
  for (const t of tasks) {
    for (const tag of t.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
