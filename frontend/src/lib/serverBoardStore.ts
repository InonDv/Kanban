import { initialBoard } from "@/lib/seed";
import type { Board } from "@/lib/types";

type Listener = (board: Board) => void;

const boards = new Map<string, Board>();
const listeners = new Map<string, Set<Listener>>();

function cloneBoard(board: Board): Board {
  return structuredClone(board);
}

export function getOrCreateBoard(id: string): Board {
  let board = boards.get(id);
  if (!board) {
    board = cloneBoard(initialBoard);
    boards.set(id, board);
  }
  return cloneBoard(board);
}

export function saveBoard(id: string, board: Board): Board {
  const next = cloneBoard(board);
  boards.set(id, next);
  const subs = listeners.get(id);
  if (subs) {
    for (const listener of subs) {
      listener(cloneBoard(next));
    }
  }
  return cloneBoard(next);
}

export function subscribeToBoard(id: string, listener: Listener): () => void {
  let set = listeners.get(id);
  if (!set) {
    set = new Set();
    listeners.set(id, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
    if (set!.size === 0) {
      listeners.delete(id);
    }
  };
}
