# Demo guide (optional signal suite)

The **live** demo for the PR Triage Agent is documented in [`README.md`](README.md)
(the task-board feature PRs currently open on GitHub).

This file is the original **signal suite**: eight older branches, one per triage
rule, with nothing overlapping. They still exist locally. They are not the
open PRs the agent is looking at unless you push them and run
`scripts/open-prs.mjs`.

## The pull requests

| Branch | Why it exists | What the agent should say |
|---|---|---|
| `feat/add-priority-field` | Small change (~24 lines), tests included, CI green | Reviewable now, quick win, high in the queue |
| `docs/update-readme` | Docs only, 17 lines, CI green | Reviewable now, trivial to review |
| `feat/search-tasks` | Medium change (70 lines), CI green | Reviewable now |
| `feat/bulk-import` | ~1000 changed lines (large), CI green | Reviewable, but flagged as a long review, lower score |
| `chore/editorconfig` | Tiny, branched from an older `main` | Reviewable now (may show as behind, depending on branch protection) |
| `fix/overdue-today` | Breaks an existing test, **CI fails** | Waiting on author: do not review yet, CI is failing |
| `refactor/rename-default-status` | Edits the same line `main` changed later, **merge conflicts** | Waiting on author: has merge conflicts |
| `wip/export-csv` | Draft | Skip for now, marked as a draft |

Things that cannot be faked with one GitHub account, so they will not appear:
**approved** and **changes requested** states and **requested reviewers** (GitHub does not let you review
or request a review from yourself), and **stale / long wait** (needs real elapsed time).
To show them, use a second GitHub account (or a teammate) to approve one PR and request changes on another,
and request a review from that account on a third.

## Questions to ask the agent

1. "What should we review first?" -> ranked queue, reviewable PRs first, blocked PRs after.
2. "Why is the overdue-today PR blocked?" -> failing CI, cited with a link.
3. "Which PRs have merge conflicts?" -> the rename PR.
4. "Is the bulk import PR safe to review quickly?" -> no, large diff, plan a longer review.
5. "Tell me about PR #99" -> must say it cannot find it (grounding, no invention).
6. "Leave a comment on the overdue PR asking the author to update the existing test" -> approval card with the
   exact text; approve it and the comment appears on GitHub. Reject it and nothing is posted.

## Setup (once)

1. Create an **empty** repo on GitHub, for example `YOUR_USER/pr-triage-demo` (no README, no .gitignore).
2. Push all branches:
   ```bash
   git remote add origin https://github.com/YOUR_USER/pr-triage-demo.git
   git push -u origin --all
   ```
3. Open the PRs (needs a token with *Pull requests: read and write* on this repo):
   ```powershell
   $env:GITHUB_TOKEN = "github_pat_..."
   node scripts/open-prs.mjs YOUR_USER/pr-triage-demo
   ```
4. In the agent's `.env`: `GITHUB_REPO=YOUR_USER/pr-triage-demo` and `GITHUB_TOKEN` (same or another fine-grained token:
   Pull requests r/w, Issues r/w, Contents read, Metadata read).
5. Wait about a minute so CI finishes and GitHub computes the merge state, then ask the agent.

To reset the demo, close the PRs (or delete the repo) and run steps 2 and 3 again.
