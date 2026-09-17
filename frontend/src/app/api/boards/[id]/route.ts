import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBoard, saveBoard } from "@/lib/serverBoardStore";
import type { Board } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json(getOrCreateBoard(id));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const board = (await request.json()) as Board;
  return NextResponse.json(saveBoard(id, board));
}
