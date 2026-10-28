/**
 * ExcaliCraft History Manager (Undo / Redo)
 * Maintains snapshots of the scene elements array with max depth limit
 */

export class HistoryManager {
  constructor(initialElements = [], maxHistory = 50) {
    this.maxHistory = maxHistory;
    this.undoStack = [this.clone(initialElements)];
    this.redoStack = [];
    this.listeners = [];
  }

  clone(elements) {
    return JSON.parse(JSON.stringify(elements, (key, value) => {
      if (key === '_drawable' || key === '_cacheKey') return undefined;
      return value;
    }));
  }

  record(elements) {
    this.undoStack.push(this.clone(elements));
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];
    this.notify();
    return this.clone(previous);
  }

  redo() {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop();
    this.undoStack.push(next);
    this.notify();
    return this.clone(next);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback({ canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  notify() {
    for (const cb of this.listeners) {
      cb({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
  }
}
