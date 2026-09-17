"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Board } from "@/components/Board";
import { PeoplePanel } from "@/components/PeoplePanel";
import { ShareButton } from "@/components/ShareButton";

function BoardLoading() {
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

function BoardApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlBoardId = searchParams.get("board");
  const [fallbackBoardId] = useState(() => crypto.randomUUID());
  const boardId = urlBoardId ?? fallbackBoardId;
  const [peopleOpen, setPeopleOpen] = useState(false);

  useEffect(() => {
    if (!urlBoardId) {
      router.replace(`/?board=${fallbackBoardId}`);
    }
  }, [urlBoardId, fallbackBoardId, router]);

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-6 px-8 pb-3 pt-6 lg:px-12 lg:pt-8">
        <div>
          <p className="text-base font-medium uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Project board
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--color-navy)] lg:text-6xl">
            Kanban
          </h1>
          <div className="mt-4 h-1.5 w-28 rounded-full bg-[var(--color-accent)]" />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="people-button"
            onClick={() => setPeopleOpen(true)}
            className="rounded-lg border border-[color-mix(in_srgb,var(--color-navy)_15%,transparent)] bg-white px-5 py-2.5 text-base font-medium text-[var(--color-navy)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            People
          </button>
          <ShareButton />
        </div>
      </header>
      <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 lg:px-10 lg:pb-8">
        <Board boardId={boardId} />
      </section>
      <PeoplePanel open={peopleOpen} onClose={() => setPeopleOpen(false)} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen flex-col overflow-hidden">
          <header className="px-8 pb-3 pt-6 lg:px-12 lg:pt-8">
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--color-navy)]">
              Kanban
            </h1>
          </header>
          <section className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 lg:px-10 lg:pb-8">
            <BoardLoading />
          </section>
        </main>
      }
    >
      <BoardApp />
    </Suspense>
  );
}
