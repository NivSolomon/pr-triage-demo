import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "../src/store.js";
import { run } from "../src/cli.js";
import { loadStore, saveStore } from "../src/storage.js";

test("add, start and done flow through the CLI", () => {
  const store = new TaskStore();
  assert.match(run(store, ["add", "write", "docs", "--due", "2030-05-06"])[0], /added #1: .*write docs/);
  assert.equal(run(store, ["start", "1"])[0], "#1 -> in-progress");
  assert.equal(run(store, ["done", "1"])[0], "#1 -> done");
});

test("list filters by status", () => {
  const store = new TaskStore();
  run(store, ["add", "a"]);
  run(store, ["add", "b"]);
  run(store, ["done", "2"]);
  assert.equal(run(store, ["list", "done"]).length, 1);
  assert.throws(() => run(store, ["list", "bogus"]), /unknown status/);
});

test("stats reports totals", () => {
  const store = new TaskStore();
  run(store, ["add", "a"]);
  assert.match(run(store, ["stats"])[0], /total: 1/);
});

test("invalid ids are rejected", () => {
  assert.throws(() => run(new TaskStore(), ["done", "abc"]), /invalid id/);
});

test("storage round-trips and tolerates a missing file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tasks-"));
  try {
    const path = join(dir, "tasks.json");
    assert.equal((await loadStore(path)).all().length, 0);
    const store = new TaskStore();
    store.add({ title: "persist me" });
    await saveStore(path, store);
    assert.equal((await loadStore(path)).all()[0].title, "persist me");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
