import { test } from "node:test";
import assert from "node:assert/strict";
import { History } from "../src/history.js";

test("a fresh history can neither undo nor redo", () => {
  const h = new History();
  assert.equal(h.canUndo, false);
  assert.equal(h.canRedo, false);
  assert.equal(h.undo("now"), null);
  assert.equal(h.redo("now"), null);
});

test("undo returns the previous snapshot and makes the current one redoable", () => {
  const h = new History();
  h.push("A"); // state was A, then changed to B
  assert.equal(h.undo("B"), "A");
  assert.equal(h.canRedo, true);
  assert.equal(h.redo("A"), "B");
  assert.equal(h.canUndo, true);
});

test("a new change after undo clears the redo stack", () => {
  const h = new History();
  h.push("A");
  h.undo("B");
  h.push("A");
  assert.equal(h.canRedo, false);
});

test("history is bounded and drops the oldest entries first", () => {
  const h = new History(3);
  ["a", "b", "c", "d"].forEach((s) => h.push(s));
  assert.equal(h.undo("e"), "d");
  assert.equal(h.undo("d"), "c");
  assert.equal(h.undo("c"), "b");
  assert.equal(h.undo("b"), null);
});

test("clear empties both stacks", () => {
  const h = new History();
  h.push("A");
  h.undo("B");
  h.clear();
  assert.equal(h.canUndo, false);
  assert.equal(h.canRedo, false);
});
