"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import type { Card as CardType, Column as ColumnType, Employee } from "@/lib/types";

type ColumnProps = {
  column: ColumnType;
  cards: CardType[];
  employees: Employee[];
  isOver: boolean;
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onEditCard: (cardId: string, title: string, details: string) => void;
  onAssignCard: (cardId: string, assigneeId: string | null) => void;
  onDeleteCard: (cardId: string) => void;
};

export function Column({
  column,
  cards,
  employees,
  isOver,
  onRename,
  onAddCard,
  onEditCard,
  onAssignCard,
  onDeleteCard,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");

  function commitTitle() {
    const next = titleDraft.trim();
    if (next && next !== column.title) {
      onRename(column.id, next);
    } else {
      setTitleDraft(column.title);
    }
    setIsEditingTitle(false);
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }
    onAddCard(column.id, title, newDetails.trim());
    setNewTitle("");
    setNewDetails("");
    setIsAdding(false);
  }

  return (
    <section
      data-testid={`column-${column.id}`}
      className={`flex h-full min-h-0 min-w-[300px] flex-1 flex-col rounded-3xl border bg-[color-mix(in_srgb,white_82%,transparent)] backdrop-blur-sm transition duration-200 ${
        isOver
          ? "border-[var(--color-accent)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_28%,transparent)]"
          : "border-[color-mix(in_srgb,var(--color-navy)_10%,transparent)]"
      }`}
    >
      <header className="shrink-0 border-b border-[color-mix(in_srgb,var(--color-navy)_8%,transparent)] px-5 py-4">
        <div className="mb-2 h-1 w-12 rounded-full bg-[var(--color-accent)]" />
        {isEditingTitle ? (
          <input
            data-testid={`column-title-input-${column.id}`}
            className="w-full rounded-lg border border-[var(--color-primary)] bg-white px-3 py-1.5 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-navy)] outline-none"
            value={titleDraft}
            autoFocus
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitTitle();
              }
              if (event.key === "Escape") {
                setTitleDraft(column.title);
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            data-testid={`column-title-${column.id}`}
            className="w-full text-left font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-navy)]"
            onClick={() => {
              setTitleDraft(column.title);
              setIsEditingTitle(true);
            }}
          >
            {column.title}
          </button>
        )}
        <p className="mt-1.5 text-sm uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
      </header>

      <div
        ref={setNodeRef}
        data-testid={`column-drop-${column.id}`}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              employees={employees}
              onEdit={onEditCard}
              onAssign={onAssignCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] px-4 py-10 text-center text-base text-[var(--color-muted)]">
            Drop cards here
          </div>
        )}
      </div>

      <footer className="shrink-0 px-4 pb-4">
        {isAdding ? (
          <form
            data-testid={`add-card-form-${column.id}`}
            onSubmit={handleAdd}
            className="space-y-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-navy)_10%,transparent)] bg-white p-4"
          >
            <input
              data-testid={`add-card-title-${column.id}`}
              className="w-full rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] px-3 py-2.5 text-base text-[var(--color-navy)] outline-none focus:border-[var(--color-primary)]"
              placeholder="Card title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              autoFocus
            />
            <textarea
              data-testid={`add-card-details-${column.id}`}
              className="w-full resize-none rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] px-3 py-2.5 text-base text-[var(--color-muted)] outline-none focus:border-[var(--color-primary)]"
              placeholder="Details"
              rows={3}
              value={newDetails}
              onChange={(event) => setNewDetails(event.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                data-testid={`add-card-submit-${column.id}`}
                className="rounded-lg bg-[var(--color-secondary)] px-4 py-2 text-base font-medium text-white transition hover:brightness-110"
              >
                Add card
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-base text-[var(--color-muted)] hover:text-[var(--color-navy)]"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle("");
                  setNewDetails("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            data-testid={`add-card-open-${column.id}`}
            className="w-full rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-secondary)_40%,transparent)] px-4 py-3 text-base font-medium text-[var(--color-secondary)] transition hover:border-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-secondary)_8%,white)]"
            onClick={() => setIsAdding(true)}
          >
            Add a card
          </button>
        )}
      </footer>
    </section>
  );
}
