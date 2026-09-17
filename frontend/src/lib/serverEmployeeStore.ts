import { initialEmployees } from "@/lib/seed";
import type { Employee } from "@/lib/types";

type Listener = (employees: Employee[]) => void;

let employees: Employee[] = structuredClone(initialEmployees);
const listeners = new Set<Listener>();

function cloneEmployees(list: Employee[]): Employee[] {
  return structuredClone(list);
}

export function getEmployees(): Employee[] {
  return cloneEmployees(employees);
}

export function saveEmployees(next: Employee[]): Employee[] {
  employees = cloneEmployees(next);
  const snapshot = cloneEmployees(employees);
  for (const listener of listeners) {
    listener(snapshot);
  }
  return snapshot;
}

export function subscribeToEmployees(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
