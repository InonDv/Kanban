"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type FormEvent } from "react";
import type { Card as CardType, Employee } from "@/lib/types";

type CardProps = {
  card: CardType;
  employees: Employee[];
  onEdit: (cardId: string, title: string, details: string) => void;
  onAssign: (cardId: string, assigneeId: string | null) => void;
  onDelete: (cardId: string) => void;
};

export function Card({
  card,
  employees,
  onEdit,
  onAssign,
  onDelete,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [detailsDraft, setDetailsDraft] = useState(card.details);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function startEditing() {
    setTitleDraft(card.title);
    setDetailsDraft(card.details);
    setIsEditing(true);
  }

  function cancelEditing() {
    setTitleDraft(card.title);
    setDetailsDraft(card.details);
    setIsEditing(false);
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const title = titleDraft.trim();
    if (!title) {
      return;
    }
    onEdit(card.id, title, detailsDraft.trim());
    setIsEditing(false);
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-testid={`card-${card.id}`}
      className={`group rounded-2xl border border-[var(--color-secondary)] bg-white p-4 shadow-[0_8px_24px_-18px_rgba(3,33,71,0.55)] transition duration-200 ${
        isDragging
          ? "z-20 scale-[1.02] opacity-90 shadow-[0_18px_40px_-16px_rgba(3,33,71,0.45)] ring-2 ring-[var(--color-accent)]"
          : "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(3,33,71,0.4)]"
      }`}
      {...(isEditing ? {} : attributes)}
      {...(isEditing ? {} : listeners)}
    >
      {isEditing ? (
        <form
          data-testid={`edit-card-form-${card.id}`}
          onSubmit={handleSave}
          className="space-y-3"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <input
            data-testid={`edit-card-title-${card.id}`}
            className="w-full rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] px-3 py-2.5 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-navy)] outline-none focus:border-[var(--color-primary)]"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            autoFocus
          />
          <textarea
            data-testid={`edit-card-details-${card.id}`}
            className="w-full resize-none rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] px-3 py-2.5 text-base text-[var(--color-muted)] outline-none focus:border-[var(--color-primary)]"
            rows={4}
            value={detailsDraft}
            onChange={(event) => setDetailsDraft(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              data-testid={`edit-card-save-${card.id}`}
              className="rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-base font-medium text-white transition hover:brightness-110"
            >
              Save
            </button>
            <button
              type="button"
              data-testid={`edit-card-cancel-${card.id}`}
              className="rounded-lg px-4 py-2 text-base text-[var(--color-muted)] hover:text-[var(--color-navy)]"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-[var(--color-navy)] lg:text-xl">
              {card.title}
            </h3>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                data-testid={`edit-card-${card.id}`}
                aria-label={`Edit ${card.title}`}
                className="rounded-md px-2 py-1 text-sm text-[var(--color-muted)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,white)] hover:text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] lg:text-base"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  startEditing();
                }}
              >
                Edit
              </button>
              <button
                type="button"
                data-testid={`delete-card-${card.id}`}
                aria-label={`Delete ${card.title}`}
                className="rounded-md px-2 py-1 text-sm text-[var(--color-muted)] transition hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] hover:text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] lg:text-base"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(card.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-muted)]">
            {card.details}
          </p>
          <label
            className="mt-3 block"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span className="sr-only">Assignee</span>
            <select
              data-testid={`assign-card-${card.id}`}
              className="w-full rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_6%,white)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] outline-none focus:border-[var(--color-primary)]"
              value={card.assigneeId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                onAssign(card.id, value ? value : null);
              }}
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </article>
  );
}
