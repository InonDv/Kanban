import { describe, expect, it } from "vitest";
import {
  addCard,
  assignCard,
  deleteCard,
  moveCard,
  renameColumn,
  updateCard,
} from "@/lib/board";
import type { Board } from "@/lib/types";

function sampleBoard(): Board {
  return {
    columns: [
      { id: "a", title: "A", cardIds: ["c1", "c2"] },
      { id: "b", title: "B", cardIds: ["c3"] },
      { id: "c", title: "C", cardIds: [] },
    ],
    cards: {
      c1: { id: "c1", title: "One", details: "First", assigneeId: "emp-1" },
      c2: { id: "c2", title: "Two", details: "Second", assigneeId: null },
      c3: { id: "c3", title: "Three", details: "Third", assigneeId: null },
    },
  };
}

describe("renameColumn", () => {
  it("renames the matching column", () => {
    const board = renameColumn(sampleBoard(), "b", "Doing");
    expect(board.columns.find((column) => column.id === "b")?.title).toBe(
      "Doing",
    );
    expect(board.columns.find((column) => column.id === "a")?.title).toBe("A");
  });
});

describe("addCard", () => {
  it("appends a card to the column and cards map", () => {
    const card = {
      id: "c4",
      title: "Four",
      details: "Fourth",
      assigneeId: null,
    };
    const board = addCard(sampleBoard(), "b", card);
    expect(board.columns.find((column) => column.id === "b")?.cardIds).toEqual([
      "c3",
      "c4",
    ]);
    expect(board.cards.c4).toEqual(card);
  });
});

describe("deleteCard", () => {
  it("removes the card from every column and the cards map", () => {
    const board = deleteCard(sampleBoard(), "c1");
    expect(board.columns[0].cardIds).toEqual(["c2"]);
    expect(board.cards.c1).toBeUndefined();
    expect(board.cards.c2).toBeDefined();
  });
});

describe("updateCard", () => {
  it("updates title and details for the matching card", () => {
    const board = updateCard(sampleBoard(), "c1", "Updated", "New details");
    expect(board.cards.c1).toEqual({
      id: "c1",
      title: "Updated",
      details: "New details",
      assigneeId: "emp-1",
    });
    expect(board.cards.c2.title).toBe("Two");
  });
});

describe("assignCard", () => {
  it("sets and clears the assignee", () => {
    const assigned = assignCard(sampleBoard(), "c2", "emp-2");
    expect(assigned.cards.c2.assigneeId).toBe("emp-2");
    const cleared = assignCard(assigned, "c2", null);
    expect(cleared.cards.c2.assigneeId).toBeNull();
  });
});

describe("moveCard", () => {
  it("reorders within the same column moving down", () => {
    const board = moveCard(sampleBoard(), "c1", "a", 1);
    expect(board.columns.find((column) => column.id === "a")?.cardIds).toEqual([
      "c2",
      "c1",
    ]);
  });

  it("reorders within the same column moving up", () => {
    const board = moveCard(sampleBoard(), "c2", "a", 0);
    expect(board.columns.find((column) => column.id === "a")?.cardIds).toEqual([
      "c2",
      "c1",
    ]);
  });

  it("moves a card to another column at the given index", () => {
    const board = moveCard(sampleBoard(), "c1", "b", 0);
    expect(board.columns.find((column) => column.id === "a")?.cardIds).toEqual([
      "c2",
    ]);
    expect(board.columns.find((column) => column.id === "b")?.cardIds).toEqual([
      "c1",
      "c3",
    ]);
  });

  it("moves a card into an empty column", () => {
    const board = moveCard(sampleBoard(), "c3", "c", 0);
    expect(board.columns.find((column) => column.id === "b")?.cardIds).toEqual(
      [],
    );
    expect(board.columns.find((column) => column.id === "c")?.cardIds).toEqual([
      "c3",
    ]);
  });
});
