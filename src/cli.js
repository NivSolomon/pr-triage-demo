#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { loadStore, saveStore } from "./storage.js";
import { formatTask } from "./format.js";
import { sortByDue } from "./sort.js";
import { summarize, dueSoon } from "./stats.js";
import { listByStatus } from "./tasks.js";
import { STATUSES } from "./store.js";

const DB_PATH = process.env.TASKS_FILE ?? "tasks.json";

const HELP = `Usage: node src/cli.js <command> [args]

  add <title> [--due YYYY-MM-DD]   create a task
  list [status]                    list tasks (sorted by due date)
  start <id>                       move a task to in-progress
  done <id>                        mark a task as done
  rename <id> <title>              change a task's title
  remove <id>                      delete a task
  stats                            show a summary
  soon [days]                      tasks due within N days (default 7)
`;

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new Error(`invalid id: ${value}`);
  return id;
}

/** Run one command against a store. Returns the lines to print. */
export function run(store, [command, ...args], now = new Date()) {
  switch (command) {
    case "add": {
      const dueIdx = args.indexOf("--due");
      const due = dueIdx === -1 ? null : args[dueIdx + 1];
      const titleParts = dueIdx === -1 ? args : args.slice(0, dueIdx);
      const task = store.add({ title: titleParts.join(" "), due });
      return [`added #${task.id}: ${formatTask(task)}`];
    }
    case "list": {
      const [status] = args;
      if (status && !STATUSES.includes(status)) throw new Error(`unknown status: ${status}`);
      const tasks = status ? listByStatus(store.all(), status) : store.all();
      return sortByDue(tasks).map((t) => `#${t.id} ${formatTask(t)}`);
    }
    case "start":
      return [`#${args[0]} -> ${store.move(parseId(args[0]), "in-progress").status}`];
    case "done":
      return [`#${args[0]} -> ${store.move(parseId(args[0]), "done").status}`];
    case "rename": {
      const [id, ...title] = args;
      return [`renamed: ${formatTask(store.update(parseId(id), { title: title.join(" ") }))}`];
    }
    case "remove":
      return [`removed: ${formatTask(store.remove(parseId(args[0])))}`];
    case "stats": {
      const s = summarize(store.all(), now);
      const parts = STATUSES.map((st) => `${st}: ${s.byStatus[st]}`).join(", ");
      return [
        `total: ${s.total} (${parts})`,
        `overdue: ${s.overdue}`,
        `completion: ${Math.round(s.completionRate * 100)}%`,
      ];
    }
    case "soon": {
      const days = args[0] ? Number(args[0]) : 7;
      return sortByDue(dueSoon(store.all(), days, now)).map((t) => `#${t.id} ${formatTask(t)}`);
    }
    default:
      return HELP.trimEnd().split("\n");
  }
}

async function main() {
  const store = await loadStore(DB_PATH);
  try {
    for (const line of run(store, process.argv.slice(2))) console.log(line);
    await saveStore(DB_PATH, store);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
