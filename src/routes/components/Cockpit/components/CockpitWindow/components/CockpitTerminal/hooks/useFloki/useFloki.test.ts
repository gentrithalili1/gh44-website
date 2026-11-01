import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubGroq } from "#/test/groq";

import { useFloki } from "./useFloki";

afterEach(() => {
  vi.unstubAllGlobals();
});

function getMessages({
  fetchStub,
  call,
}: {
  fetchStub: ReturnType<typeof stubGroq>;
  call: number;
}): unknown[] {
  const body: unknown = JSON.parse(String(fetchStub.mock.calls[call]?.[1]?.body));
  if (typeof body !== "object" || body === null || !("messages" in body)) return [];
  return Array.isArray(body.messages) ? body.messages : [];
}

describe("useFloki", () => {
  it("answers with what to say and where to fly", async () => {
    stubGroq([{ say: "Course set for work.", go: "work" }]);
    const { result } = renderHook(() => useFloki());

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("take me to your jobs");
    });

    expect(outcome).toEqual({
      status: "answered",
      say: "Course set for work.",
      destination: expect.objectContaining({ route: "/work" }),
    });
  });

  it("sends the earlier turns along with a new question", async () => {
    const fetchStub = stubGroq([{ say: "Gentrit built me." }, { say: "In Pristina." }]);
    const { result } = renderHook(() => useFloki());

    await act(() => result.current.ask("who built you"));
    await act(() => result.current.ask("where"));

    expect(getMessages({ fetchStub, call: 1 }).slice(1)).toEqual([
      { role: "user", content: "who built you" },
      { role: "assistant", content: '{"say":"Gentrit built me."}' },
      { role: "user", content: "where" },
    ]);
  });

  it("says when the comms are down", async () => {
    stubGroq([{ status: 500 }]);
    const { result } = renderHook(() => useFloki());

    let outcome;
    await act(async () => {
      outcome = await result.current.ask("hello");
    });

    expect(outcome).toEqual({ status: "failed", reason: "unavailable" });
  });
});
