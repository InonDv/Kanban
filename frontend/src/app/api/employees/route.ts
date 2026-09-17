import { NextRequest, NextResponse } from "next/server";
import { getEmployees, saveEmployees } from "@/lib/serverEmployeeStore";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getEmployees());
}

export async function PUT(request: NextRequest) {
  const employees = (await request.json()) as Employee[];
  return NextResponse.json(saveEmployees(employees));
}
