import type { Board, Card } from "./types";

export function renameColumn(
  board: Board,
  columnId: string,
  title: string,
): Board {
  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, title } : column,
    ),
  };
}

export function addCard(
  board: Board,
  columnId: string,
  card: Card,
): Board {
  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cardIds: [...column.cardIds, card.id] }
        : column,
    ),
    cards: {
      ...board.cards,
      [card.id]: card,
    },
  };
}

export function deleteCard(board: Board, cardId: string): Board {
  const { [cardId]: _removed, ...cards } = board.cards;
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    })),
    cards,
  };
}

export function updateCard(
  board: Board,
  cardId: string,
  title: string,
  details: string,
): Board {
  const existing = board.cards[cardId];
  if (!existing) {
    return board;
  }
  return {
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...existing,
        title,
        details,
      },
    },
  };
}

export function assignCard(
  board: Board,
  cardId: string,
  assigneeId: string | null,
): Board {
  const existing = board.cards[cardId];
  if (!existing) {
    return board;
  }
  return {
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...existing,
        assigneeId,
      },
    },
  };
}

export function moveCard(
  board: Board,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Board {
  const fromColumn = board.columns.find((column) =>
    column.cardIds.includes(cardId),
  );
  if (!fromColumn) {
    return board;
  }

  const columns = board.columns.map((column) => ({
    ...column,
    cardIds: [...column.cardIds],
  }));

  const source = columns.find((column) => column.id === fromColumn.id)!;
  const destination = columns.find((column) => column.id === toColumnId);
  if (!destination) {
    return board;
  }

  const fromIndex = source.cardIds.indexOf(cardId);
  source.cardIds.splice(fromIndex, 1);
  destination.cardIds.splice(Math.max(0, toIndex), 0, cardId);

  return {
    ...board,
    columns,
  };
}

export function createCardId(): string {
  return `card-${crypto.randomUUID()}`;
}
