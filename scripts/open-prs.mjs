// Opens the demo pull requests on GitHub (one per branch). Run AFTER `git push -u origin --all`.
//
//   $env:GITHUB_TOKEN = "github_pat_..."          # PowerShell
//   node scripts/open-prs.mjs owner/pr-triage-demo
//
// The token needs "Pull requests: read and write" on this repo. Safe to re-run: existing PRs are skipped.

const repo = process.argv[2] ?? process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) {
  console.error("Usage: GITHUB_TOKEN=... node scripts/open-prs.mjs owner/repo");
  process.exit(1);
}

const PRS = [
  {
    head: "feat/add-priority-field",
    title: "Add optional priority field to tasks",
    draft: false,
    body: "Adds `priority` (low | normal | high) to `createTask` and shows it in `formatTask`.\n\nSmall, tests included, CI should be green.",
  },
  {
    head: "docs/update-readme",
    title: "Docs: explain how to run the tests",
    draft: false,
    body: "Documentation only. Adds a short usage section to the README.",
  },
  {
    head: "feat/search-tasks",
    title: "Add searchTasks helper",
    draft: false,
    body: "Case-insensitive title search with an optional status filter. Medium-sized change with its own tests.",
  },
  {
    head: "fix/overdue-today",
    title: "Treat tasks due right now as overdue",
    draft: false,
    body: "Changes `isOverdue` to use `<=`.\n\nNOTE: I did not update the existing test, so CI is expected to FAIL on this PR.",
  },
  {
    head: "feat/bulk-import",
    title: "Bulk import tasks from JSON (with 150-task sample file)",
    draft: false,
    body: "Adds `importTasks` plus a large sample data file. Big diff on purpose: more than 800 changed lines.",
  },
  {
    head: "refactor/rename-default-status",
    title: "Rename default status from 'todo' to 'open'",
    draft: false,
    body: "Touches the same line that `main` changed afterwards, so this PR is expected to have MERGE CONFLICTS.",
  },
  {
    head: "chore/editorconfig",
    title: "Add .editorconfig",
    draft: false,
    body: "Tiny housekeeping change. Branched from an older `main`, so it is behind the base branch.",
  },
  {
    head: "wip/export-csv",
    title: "WIP: export tasks to CSV",
    draft: true,
    body: "Draft. Not ready for review yet; the quoting logic is still missing.",
  },
];

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

const owner = repo.split("/")[0];
const existing = await gh("/pulls?state=open&per_page=100");
const have = new Set(existing.map((p) => p.head.ref));

for (const pr of PRS) {
  if (have.has(pr.head)) {
    console.log(`skip   ${pr.head} (PR already open)`);
    continue;
  }
  try {
    const created = await gh("/pulls", {
      method: "POST",
      body: JSON.stringify({
        title: pr.title,
        head: pr.head,
        base: "main",
        body: pr.body,
        draft: pr.draft,
      }),
    });
    console.log(`opened #${created.number}  ${pr.head}${pr.draft ? " (draft)" : ""}  ${created.html_url}`);
  } catch (err) {
    console.error(`FAILED ${pr.head}: ${err.message}`);
    process.exitCode = 1;
  }
}
console.log(`\nDone. Point the agent at it with GITHUB_REPO=${repo} (owner: ${owner}).`);
