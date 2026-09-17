import { describe, expect, it } from "vitest";
import type { Board, Employee } from "@/lib/types";
import { getAssigneeWorkload } from "@/lib/workload";

describe("getAssigneeWorkload", () => {
  it("returns only people with at least one assigned task, sorted by count", () => {
    const board: Board = {
      columns: [{ id: "a", title: "A", cardIds: ["c1", "c2", "c3"] }],
      cards: {
        c1: { id: "c1", title: "One", details: "", assigneeId: "emp-1" },
        c2: { id: "c2", title: "Two", details: "", assigneeId: "emp-2" },
        c3: { id: "c3", title: "Three", details: "", assigneeId: "emp-1" },
      },
    };
    const employees: Employee[] = [
      { id: "emp-1", name: "Alex" },
      { id: "emp-2", name: "Jordan" },
      { id: "emp-3", name: "Sam" },
    ];

    expect(getAssigneeWorkload(board, employees)).toEqual([
      { employeeId: "emp-1", name: "Alex", count: 2 },
      { employeeId: "emp-2", name: "Jordan", count: 1 },
    ]);
  });
});
