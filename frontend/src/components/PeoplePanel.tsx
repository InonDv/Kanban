"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createEmployeeId } from "@/lib/employees";
import type { Employee } from "@/lib/types";

type PeoplePanelProps = {
  open: boolean;
  onClose: () => void;
};

export function PeoplePanel({ open, onClose }: PeoplePanelProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const source = new EventSource("/api/employees/events");
    source.onmessage = (event) => {
      setEmployees(JSON.parse(event.data) as Employee[]);
    };
    return () => source.close();
  }, [open]);

  function publish(next: Employee[]) {
    setEmployees(next);
    void fetch("/api/employees", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const name = nameDraft.trim();
    if (!name) {
      return;
    }
    publish([...employees, { id: createEmployeeId(), name }]);
    setNameDraft("");
  }

  function handleRemove(employeeId: string) {
    publish(employees.filter((employee) => employee.id !== employeeId));
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-navy)_35%,transparent)] p-4"
      onClick={onClose}
    >
      <div
        data-testid="people-panel"
        className="w-full max-w-md rounded-3xl border border-[color-mix(in_srgb,var(--color-navy)_10%,transparent)] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(3,33,71,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-navy)]">
              People
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Company-wide names available for task assignment.
            </p>
          </div>
          <button
            type="button"
            data-testid="people-panel-close"
            className="rounded-md px-2 py-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-navy)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-5 flex gap-2">
          <input
            data-testid="people-name-input"
            className="min-w-0 flex-1 rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] px-3 py-2.5 text-base text-[var(--color-navy)] outline-none focus:border-[var(--color-primary)]"
            placeholder="Employee name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
          />
          <button
            type="submit"
            data-testid="people-add-submit"
            className="rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-base font-medium text-white transition hover:brightness-110"
          >
            Add
          </button>
        </form>

        <ul className="mt-5 max-h-72 space-y-2 overflow-y-auto">
          {employees.map((employee) => (
            <li
              key={employee.id}
              data-testid={`people-row-${employee.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-navy)_8%,transparent)] px-3 py-2.5"
            >
              <span className="text-base text-[var(--color-navy)]">
                {employee.name}
              </span>
              <button
                type="button"
                data-testid={`people-remove-${employee.id}`}
                className="rounded-md px-2 py-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-navy)]"
                onClick={() => handleRemove(employee.id)}
              >
                Remove
              </button>
            </li>
          ))}
          {employees.length === 0 && (
            <li className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] px-3 py-6 text-center text-sm text-[var(--color-muted)]">
              No people yet. Add a name to start assigning tasks.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
