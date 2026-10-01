import type { SharedPuzzle } from './share';

type SharedPuzzleListener = (puzzle: SharedPuzzle) => void;

let pendingPuzzle: SharedPuzzle | null = null;
const listeners = new Set<SharedPuzzleListener>();

export function setPendingSharedPuzzle(puzzle: SharedPuzzle) {
  pendingPuzzle = puzzle;
  listeners.forEach((listener) => listener(puzzle));
}

export function consumePendingSharedPuzzle(): SharedPuzzle | null {
  const puzzle = pendingPuzzle;
  pendingPuzzle = null;
  return puzzle;
}

export function subscribeSharedPuzzle(listener: SharedPuzzleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
