import { NextRequest } from "next/server";
import {
  getEmployees,
  subscribeToEmployees,
} from "@/lib/serverEmployeeStore";
import type { Employee } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let unsubscribe = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (employees: Employee[]) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(employees)}\n\n`),
        );
      };

      send(getEmployees());
      unsubscribe = subscribeToEmployees(send);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      const close = () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", close);
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
