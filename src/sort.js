/** Sort by due date, earliest first. Tasks without a due date go last. Does not mutate the input. */
export function sortByDue(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.due && !b.due) return a.id - b.id;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return new Date(a.due).getTime() - new Date(b.due).getTime();
  });
}

/** Sort alphabetically by title, case-insensitive. */
export function sortByTitle(tasks) {
  return [...tasks].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
}

/** Group tasks into `{ [status]: Task[] }`. */
export function groupByStatus(tasks) {
  const groups = {};
  for (const t of tasks) (groups[t.status] ??= []).push(t);
  return groups;
}
