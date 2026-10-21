export const REPEATS = ["none", "daily", "weekly", "monthly"];

const DAY_MS = 24 * 60 * 60 * 1000;

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * The due date of the next occurrence, as an ISO string (UTC).
 * Monthly repeats keep the day of month but clamp to the end of shorter months
 * (Jan 31 -> Feb 28/29 -> Mar 28/29 ...). The time of day is preserved.
 */
export function nextDue(due, repeat) {
  if (!REPEATS.includes(repeat)) throw new Error(`unknown repeat: ${repeat}`);
  if (repeat === "none") return null;
  const date = new Date(due);
  if (Number.isNaN(date.getTime())) throw new Error(`invalid due date: ${due}`);

  if (repeat === "daily") return new Date(date.getTime() + DAY_MS).toISOString();
  if (repeat === "weekly") return new Date(date.getTime() + 7 * DAY_MS).toISOString();

  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear() + Math.floor(month / 12);
  const monthIndex = month % 12;
  const day = Math.min(date.getUTCDate(), daysInMonth(year, monthIndex));
  return new Date(
    Date.UTC(year, monthIndex, day, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()),
  ).toISOString();
}

/**
 * Build the follow-up task for a completed recurring task, or null if it does not repeat.
 * The new task starts in "backlog" and keeps the title and repeat rule.
 */
export function spawnNext(task) {
  if (!task.repeat || task.repeat === "none") return null;
  return { title: task.title, due: nextDue(task.due, task.repeat), repeat: task.repeat, status: "backlog" };
}
