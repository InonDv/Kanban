export type Employee = {
  id: string;
  name: string;
};

export type Card = {
  id: string;
  title: string;
  details: string;
  assigneeId: string | null;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type Board = {
  columns: Column[];
  cards: Record<string, Card>;
};
