import { vi } from "vitest";

type GroqReply = { say: string; go?: string | null } | { status: number };

// Stands in for the Groq API: each call answers with the next reply, as JSON in a chat
// completion, or with an error status. Returns the fetch stub to read the requests from.
export function stubGroq(replies: readonly GroqReply[]) {
  vi.stubEnv("FLOKI_GROQ_API_KEY", "test-key");
  let index = 0;
  const fetchStub = vi.fn(async (_url: string, _init?: RequestInit) => {
    const reply = replies[Math.min(index, replies.length - 1)];
    index += 1;
    if (reply && "status" in reply) return new Response("{}", { status: reply.status });

    return Response.json({
      choices: [{ message: { content: JSON.stringify({ go: null, ...reply }) } }],
    });
  });
  vi.stubGlobal("fetch", fetchStub);

  return fetchStub;
}
