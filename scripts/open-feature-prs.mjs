// Opens (and repairs) the task-board feature pull requests on GitHub.
// Run AFTER `main` and the feature branches have been pushed.
//
//   $env:GITHUB_TOKEN = "github_pat_..."          # PowerShell
//   node scripts/open-feature-prs.mjs owner/pr-triage-demo
//
// The token needs "Pull requests: read and write" on this repo.
// Safe to re-run: leftover/wrong-direction PRs are closed, missing PRs are opened,
// empty bodies are filled, and a ready WIP is converted to a draft.

const repo = process.argv[2] ?? process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) {
  console.error("Usage: GITHUB_TOKEN=... node scripts/open-feature-prs.mjs owner/repo");
  process.exit(1);
}

const PRS = [
  {
    head: "feat/task-tags",
    title: "Add tags to tasks with a tag filter bar",
    draft: false,
    body: [
      "Adds free-form tags to tasks and a filter bar on the board.",
      "",
      "- `src/tags.js`: `normalizeTags` (lower-case, strips `#`, de-dupes, max 5), `filterByTag`, `tagCounts`",
      "- `TaskStore.add` / `update` accept `tags`; old saved tasks without tags keep working",
      "- UI: tags input in the form and edit mode, tag chips on cards, `TagFilter` bar with counts",
      "- 7 new tests; build and tests pass locally",
      "",
      "Touches `store.js`, `App.jsx`, `TaskForm.jsx` and `TaskCard.jsx`, so it overlaps with `feat/recurring-tasks`.",
    ].join("\n"),
  },
  {
    head: "feat/undo-redo",
    title: "Add undo/redo for board changes",
    draft: false,
    body: [
      "Every add, move, edit and delete can now be undone and redone.",
      "",
      "- New `History` class (`src/history.js`): bounded stack (50 steps), redo is cleared by a new change",
      "- `useTaskStore` records a snapshot before each successful change (failed actions create no undo step)",
      "- Undo / Redo buttons in the header plus Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (Ctrl+Y); shortcuts are ignored while typing",
      "- 5 new tests for `History`",
      "",
      "Reviewer note: the hook rewrites the store instance on undo, so ids can be re-used after undoing an add. Intentional for now.",
    ].join("\n"),
  },
  {
    head: "feat/recurring-tasks",
    title: "Add recurring tasks (daily / weekly / monthly)",
    draft: false,
    body: [
      "Completing a recurring task schedules its next occurrence in the backlog.",
      "",
      "- `src/recurrence.js`: `nextDue` (monthly clamps to the end of short months, handles leap years and year rollover) and `spawnNext`",
      "- `TaskStore.add` takes `repeat`; recurring tasks require a due date; `move(..., 'done')` spawns the next task once",
      "- UI: repeat selector in the form, repeat label on cards",
      "- 12 new tests including month-end and leap-year cases",
      "",
      "Overlaps with `feat/task-tags` in `store.js` and `TaskForm.jsx`; whichever lands second will need a rebase.",
    ].join("\n"),
  },
  {
    head: "feat/dark-mode",
    title: "Add dark mode with a persisted theme toggle",
    draft: false,
    body: [
      "Adds a light/dark toggle in the header. The choice is saved in localStorage and defaults to the OS setting.",
      "",
      "- Colours moved to CSS variables; `:root[data-theme=dark]` overrides them",
      "- `useTheme` hook and `ThemeToggle` component",
      "",
      "Works on my machine (`npm run build` is fine locally). I have not checked CI yet.",
    ].join("\n"),
  },
  {
    head: "ci/node-matrix-and-coverage",
    title: "CI: test on Node 20.19 and 22, publish a coverage summary",
    draft: false,
    body: [
      "Runs the test job on the lowest and highest Node versions allowed by `engines`, and prints a coverage table in the job summary.",
      "",
      "- Matrix `node: [20.19, 22]` with `fail-fast: false`",
      "- New `npm run test:coverage` script (Node's built-in coverage, no new dependencies)",
      "- Job name changes to `Test and build (Node <version>)`. If branch protection requires the old check name, it must be updated before merging.",
      "",
      "Changes a workflow file, so worth a careful look even though the diff is small.",
    ].join("\n"),
  },
  {
    head: "refactor/extract-status-select",
    title: "Refactor: extract StatusSelect and drop unused renameTask",
    draft: false,
    body: [
      "Pulls the status dropdown out of `TaskCard` into a reusable `StatusSelect` and removes the unused `renameTask` action from `useTaskStore`.",
      "",
      "No behaviour change. Branched before the edit-task work landed on `main`, so expect conflicts in `TaskCard.jsx` and `useTaskStore.js`.",
    ].join("\n"),
  },
  {
    head: "wip/drag-and-drop",
    title: "WIP: drag cards between columns",
    draft: true,
    body: "Draft. Cards can be dragged between columns, but dropping onto the same column and a keyboard alternative are still TODO. No tests yet.",
  },
];

const LEFTOVER_HEADS = new Set(["Branch-Test", "Branch-Test2"]);
const WANTED = new Map(PRS.map((p) => [p.head, p]));

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${data?.message ?? text}`);
  return data;
}

async function closePr(pr, reason) {
  await gh(`/pulls/${pr.number}`, { method: "PATCH", body: JSON.stringify({ state: "closed" }) });
  console.log(`closed #${pr.number}  ${pr.head.ref}  (${reason})`);
}

const existing = await gh("/pulls?state=open&per_page=100");

for (const open of existing) {
  const head = open.head.ref;
  const base = open.base.ref;
  if (LEFTOVER_HEADS.has(head) || head === "main" || base !== "main") {
    try {
      await closePr(open, "not part of the demo suite");
    } catch (err) {
      console.error(`FAILED close #${open.number}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

const stillOpen = await gh("/pulls?state=open&per_page=100");
const byHead = new Map(stillOpen.map((p) => [p.head.ref, p]));

for (const spec of PRS) {
  const open = byHead.get(spec.head);
  try {
    if (!open) {
      const created = await gh("/pulls", {
        method: "POST",
        body: JSON.stringify({
          title: spec.title,
          head: spec.head,
          base: "main",
          body: spec.body,
          draft: spec.draft,
        }),
      });
      console.log(`opened #${created.number}  ${spec.head}${spec.draft ? " (draft)" : ""}  ${created.html_url}`);
      continue;
    }

    if (spec.draft && !open.draft) {
      await closePr(open, "must be a draft");
      const created = await gh("/pulls", {
        method: "POST",
        body: JSON.stringify({
          title: spec.title,
          head: spec.head,
          base: "main",
          body: spec.body,
          draft: true,
        }),
      });
      console.log(`opened #${created.number}  ${spec.head} (draft)  ${created.html_url}`);
      continue;
    }

    if (!open.body || open.body.trim() === "") {
      await gh(`/pulls/${open.number}`, {
        method: "PATCH",
        body: JSON.stringify({ title: spec.title, body: spec.body }),
      });
      console.log(`body   #${open.number}  ${spec.head}`);
    } else {
      console.log(`ok     #${open.number}  ${spec.head}${open.draft || spec.draft ? " (draft)" : ""}`);
    }
  } catch (err) {
    console.error(`FAILED ${spec.head}: ${err.message}`);
    process.exitCode = 1;
  }
}

const wantedHeads = new Set(WANTED.keys());
const leftover = (await gh("/pulls?state=open&per_page=100")).filter(
  (p) => !wantedHeads.has(p.head.ref) || p.base.ref !== "main",
);
if (leftover.length) {
  console.log("\nStill open and not in the demo suite:");
  for (const p of leftover) console.log(`  #${p.number}  ${p.head.ref} -> ${p.base.ref}  ${p.title}`);
}

console.log("\nDone.");
