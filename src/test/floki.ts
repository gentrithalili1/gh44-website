import { vi } from "vitest";

type FlokiReply = { say: string; go?: string | null } | { status: number };

type StubFlokiParams = {
  // Groq's answers, one per question; the last one repeats.
  replies: readonly FlokiReply[];
  // Whether the voice service (Piper) is up.
  hasVoice?: boolean;
  // Whether Floki's lines play to the end by themselves; off to cut one off in a test.
  shouldFinishSpeaking?: boolean;
};

const VOICE_URL = "http://floki-voice.test";
// A few bytes stand in for a WAV file.
const FAKE_WAV = new Uint8Array([82, 73, 70, 70]);

// Stands in for Floki's services: Groq answers each question with the next reply (JSON in a chat
// completion, or an error status), Piper turns lines into audio, and the audio element plays it.
// Returns the fetch stub and the audio players to read what happened.
export function stubFloki({
  replies,
  hasVoice = true,
  shouldFinishSpeaking = true,
}: StubFlokiParams) {
  vi.stubEnv("FLOKI_GROQ_API_KEY", "test-key");
  vi.stubEnv("FLOKI_TTS_URL", VOICE_URL);
  let replyIndex = 0;

  const fetchStub = vi.fn(async (url: string | URL, _init?: RequestInit) => {
    if (String(url).startsWith(VOICE_URL)) {
      return hasVoice ? new Response(FAKE_WAV) : new Response("down", { status: 502 });
    }
    const reply = replies[Math.min(replyIndex, replies.length - 1)];
    replyIndex += 1;
    if (reply && "status" in reply) return new Response("{}", { status: reply.status });

    return Response.json({
      choices: [{ message: { content: JSON.stringify({ go: null, ...reply }) } }],
    });
  });
  vi.stubGlobal("fetch", fetchStub);

  const players: FakeVoiceAudio[] = [];
  class FakeVoiceAudio extends EventTarget {
    src: string;
    paused = true;
    pause = vi.fn(() => {
      this.paused = true;
    });
    play = vi.fn(async () => {
      this.paused = false;
      if (shouldFinishSpeaking) queueMicrotask(() => this.dispatchEvent(new Event("ended")));
    });

    constructor(src: string) {
      super();
      this.src = src;
      players.push(this);
    }
  }
  vi.stubGlobal("Audio", FakeVoiceAudio);

  return { fetchStub, players };
}

// The text Floki sent to the voice service, per call.
export function getSpokenLines(fetchStub: ReturnType<typeof stubFloki>["fetchStub"]) {
  return fetchStub.mock.calls
    .filter(([url]) => String(url).startsWith(VOICE_URL))
    .map(([, init]) => {
      const body: unknown = JSON.parse(String(init?.body));
      return typeof body === "object" && body !== null && "text" in body ? body.text : undefined;
    });
}

// The bodies Floki sent to the model, per question.
export function getModelRequests(fetchStub: ReturnType<typeof stubFloki>["fetchStub"]) {
  return fetchStub.mock.calls
    .filter(([url]) => !String(url).startsWith(VOICE_URL))
    .map(([, init]) => String(init?.body));
}
