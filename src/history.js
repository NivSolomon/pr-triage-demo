/**
 * Bounded undo/redo stack of immutable snapshots.
 *
 *   history.push(before)          // record the state before a change (clears redo)
 *   history.undo(current)         // -> previous snapshot, or null; `current` becomes redoable
 *   history.redo(current)         // -> next snapshot, or null; `current` becomes undoable
 */
export class History {
  constructor(limit = 50) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  push(snapshot) {
    this.past.push(snapshot);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  undo(current) {
    if (!this.canUndo) return null;
    this.future.push(current);
    return this.past.pop();
  }

  redo(current) {
    if (!this.canRedo) return null;
    this.past.push(current);
    return this.future.pop();
  }

  clear() {
    this.past = [];
    this.future = [];
  }
}
