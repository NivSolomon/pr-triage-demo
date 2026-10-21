import { test } from "node:test";
import assert from "node:assert/strict";
import { TaskStore } from "../src/store.js";

test("add assigns incrementing ids", () => {
  const store = new TaskStore();
  assert.equal(store.add({ title: "a" }).id, 1);
  assert.equal(store.add({ title: "b" }).id, 2);
});

test("ids continue after loading existing tasks", () => {
  const store = new TaskStore([{ id: 7, title: "x", due: null, status: "backlog" }]);
  assert.equal(store.add({ title: "y" }).id, 8);
});

test("move changes status and rejects unknown statuses", () => {
  const store = new TaskStore();
  const { id } = store.add({ title: "a" });
  assert.equal(store.move(id, "done").status, "done");
  assert.throws(() => store.move(id, "nope"), /unknown status/);
});

test("update changes the title and validates it", () => {
  const store = new TaskStore();
  const { id } = store.add({ title: "a" });
  assert.equal(store.update(id, { title: "  b " }).title, "b");
  assert.throws(() => store.update(id, { title: " " }), /title is required/);
});

test("remove deletes a task; get on a missing id throws", () => {
  const store = new TaskStore();
  const { id } = store.add({ title: "a" });
  store.remove(id);
  assert.equal(store.all().length, 0);
  assert.throws(() => store.get(id), /not found/);
});
