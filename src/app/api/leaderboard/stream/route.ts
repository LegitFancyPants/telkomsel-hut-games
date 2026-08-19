import { NextRequest } from "next/server";
import { leaderboardEventEmitter } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`));

      const unsubscribe = leaderboardEventEmitter.subscribe((data) => {
        try {
          controller.enqueue(
            encoder.encode(`event: update\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch (e) {
          // Stream closed
        }
      });

      const timer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(timer);
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(timer);
      });
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
