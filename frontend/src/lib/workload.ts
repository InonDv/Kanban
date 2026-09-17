import type { Board, Employee } from "./types";

export type WorkloadItem = {
  employeeId: string;
  name: string;
  count: number;
};

export function getAssigneeWorkload(
  board: Board,
  employees: Employee[],
): WorkloadItem[] {
  const counts = new Map<string, number>();

  for (const card of Object.values(board.cards)) {
    if (!card.assigneeId) {
      continue;
    }
    counts.set(card.assigneeId, (counts.get(card.assigneeId) ?? 0) + 1);
  }

  return employees
    .map((employee) => ({
      employeeId: employee.id,
      name: employee.name,
      count: counts.get(employee.id) ?? 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
