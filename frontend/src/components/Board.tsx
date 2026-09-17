"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { Column } from "@/components/Column";
import { WorkloadBar } from "@/components/WorkloadBar";
import {
  addCard,
  assignCard,
  createCardId,
  deleteCard,
  moveCard,
  renameColumn,
  updateCard,
} from "@/lib/board";
import type {
  Board as BoardType,
  Card as CardType,
  Employee,
} from "@/lib/types";
import { getAssigneeWorkload } from "@/lib/workload";

type BoardProps = {
  boardId: string;
};

export function Board({ boardId }: BoardProps) {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/boards/${boardId}/events`);
    source.onmessage = (event) => {
      setBoard(JSON.parse(event.data) as BoardType);
    };
    return () => source.close();
  }, [boardId]);

  useEffect(() => {
    const source = new EventSource("/api/employees/events");
    source.onmessage = (event) => {
      setEmployees(JSON.parse(event.data) as Employee[]);
    };
    return () => source.close();
  }, []);

  function updateBoard(updater: (current: BoardType) => BoardType) {
    setBoard((current) => {
      if (!current) {
        return current;
      }
      const next = updater(current);
      void fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      return next;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = useMemo(
    () => new Set(board?.columns.map((column) => column.id) ?? []),
    [board?.columns],
  );

  const assigneeName = useMemo(() => {
    if (!activeCard?.assigneeId) {
      return null;
    }
    return (
      employees.find((employee) => employee.id === activeCard.assigneeId)
        ?.name ?? null
    );
  }, [activeCard, employees]);

  const workload = useMemo(
    () => (board ? getAssigneeWorkload(board, employees) : []),
    [board, employees],
  );

  function findColumnId(id: string): string | undefined {
    if (!board) {
      return undefined;
    }
    if (columnIds.has(id)) {
      return id;
    }
    return board.columns.find((column) => column.cardIds.includes(id))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    if (!board) {
      return;
    }
    const card = board.cards[String(event.active.id)];
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const columnId = findColumnId(String(over.id));
    setOverColumnId(columnId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setOverColumnId(null);

    if (!over || !board) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromColumnId = findColumnId(activeId);
    const toColumnId = findColumnId(overId);

    if (!fromColumnId || !toColumnId) {
      return;
    }

    const destination = board.columns.find(
      (column) => column.id === toColumnId,
    );
    if (!destination) {
      return;
    }

    let toIndex: number;
    if (columnIds.has(overId)) {
      toIndex = destination.cardIds.length;
    } else {
      toIndex = destination.cardIds.indexOf(overId);
      if (toIndex < 0) {
        toIndex = destination.cardIds.length;
      }
    }

    if (fromColumnId === toColumnId) {
      const fromIndex = destination.cardIds.indexOf(activeId);
      if (fromIndex === toIndex || fromIndex < 0) {
        return;
      }
    }

    updateBoard((current) => moveCard(current, activeId, toColumnId, toIndex));
  }

  if (!board) {
    return (
      <div
        data-testid="board-loading"
        className="flex h-full min-h-0 gap-5"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-full min-w-0 flex-1 animate-pulse rounded-3xl bg-white/50"
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveCard(null);
        setOverColumnId(null);
      }}
    >
      <div className="flex h-full min-h-0 flex-col">
        <WorkloadBar items={workload} />
        <div
          data-testid="board"
          className="flex min-h-0 flex-1 gap-5 overflow-x-auto"
        >
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              employees={employees}
              cards={column.cardIds
                .map((id) => board.cards[id])
                .filter(Boolean)}
              isOver={overColumnId === column.id}
              onRename={(columnId, title) =>
                updateBoard((current) => renameColumn(current, columnId, title))
              }
              onAddCard={(columnId, title, details) =>
                updateBoard((current) =>
                  addCard(current, columnId, {
                    id: createCardId(),
                    title,
                    details,
                    assigneeId: null,
                  }),
                )
              }
              onEditCard={(cardId, title, details) =>
                updateBoard((current) =>
                  updateCard(current, cardId, title, details),
                )
              }
              onAssignCard={(cardId, assigneeId) =>
                updateBoard((current) =>
                  assignCard(current, cardId, assigneeId),
                )
              }
              onDeleteCard={(cardId) =>
                updateBoard((current) => deleteCard(current, cardId))
              }
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <article className="w-[340px] rounded-2xl border border-[var(--color-secondary)] bg-white p-4 shadow-[0_20px_40px_-16px_rgba(3,33,71,0.45)]">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-navy)]">
              {activeCard.title}
            </h3>
            <p className="mt-2 text-base text-[var(--color-muted)]">
              {activeCard.details}
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--color-primary)]">
              {assigneeName ?? "Unassigned"}
            </p>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
