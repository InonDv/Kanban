import type { Board, Employee } from "./types";

export const initialEmployees: Employee[] = [
  { id: "emp-1", name: "Alex Chen" },
  { id: "emp-2", name: "Jordan Lee" },
  { id: "emp-3", name: "Sam Rivera" },
  { id: "emp-4", name: "Taylor Brooks" },
];

export const initialBoard: Board = {
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cardIds: ["card-1", "card-2"],
    },
    {
      id: "col-todo",
      title: "To Do",
      cardIds: ["card-3", "card-4"],
    },
    {
      id: "col-progress",
      title: "In Progress",
      cardIds: ["card-5"],
    },
    {
      id: "col-review",
      title: "Review",
      cardIds: ["card-6"],
    },
    {
      id: "col-done",
      title: "Done",
      cardIds: ["card-7"],
    },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Audit current homepage",
      details: "List conversion blockers and outdated content on the live site.",
      assigneeId: "emp-1",
    },
    "card-2": {
      id: "card-2",
      title: "Collect brand assets",
      details: "Gather logos, colors, and typography for the new design system.",
      assigneeId: null,
    },
    "card-3": {
      id: "card-3",
      title: "Wireframe key pages",
      details: "Draft layouts for home, pricing, and contact.",
      assigneeId: "emp-2",
    },
    "card-4": {
      id: "card-4",
      title: "Set up staging environment",
      details: "Provision hosting and CI for the redesign preview.",
      assigneeId: "emp-3",
    },
    "card-5": {
      id: "card-5",
      title: "Build responsive navigation",
      details: "Implement desktop and mobile nav with accessibility checks.",
      assigneeId: "emp-2",
    },
    "card-6": {
      id: "card-6",
      title: "Review hero section copy",
      details: "Check tone, CTA clarity, and brand alignment before launch.",
      assigneeId: "emp-4",
    },
    "card-7": {
      id: "card-7",
      title: "Publish design tokens",
      details: "Ship shared color and spacing tokens to the team.",
      assigneeId: "emp-1",
    },
  },
};
