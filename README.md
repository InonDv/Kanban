# Kanban

A live collaborative Kanban web app for small teams.

Share a board link, move cards across five columns, assign work to people, and see updates appear for everyone connected to the same board.

## Features

- Single board with five renameable columns
- Cards with title, details, and one assignee
- Drag and drop between columns
- Company-wide people list (add names, assign from each card)
- Workload chips showing how many tasks each person has
- Live sync over a shared URL
- Seeded example tasks on first open

## Project layout

```
frontend/   Next.js app (UI, API, tests)
```

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
cd frontend
npm test
npm run test:e2e
```

For Playwright e2e tests, install the browser once:

```bash
npx playwright install chromium
```

## Sharing

Use **Share** to copy the board URL. Anyone who opens that link on the same running server sees edits live. On a local network, share the Network URL from the Next.js terminal (not only `localhost`).
