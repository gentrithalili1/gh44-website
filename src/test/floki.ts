import { vi } from "vitest";

type FlokiReply = { say: string; go?: string | null } | { status: number };

type StubFlokiParams = {
  // Groq's answers, one per question; the last one repeats.
  replies: readonly FlokiReply[];
  // Whether the voice service (Piper) is up.
  hasVoice?: boolean;
  // Whether Floki's lines play to the end by themselves; off to cut one off in a test.
  shouldFinishSpeaking?: boolean;
  // How long the model takes to answer, in ms.
  answerDelay?: number;
};

const VOICE_URL = "http://floki-voice.test";
// A few bytes stand in for a WAV file.
const FAKE_WAV = new Uint8Array([82, 73, 70, 70]);

export function stubFloki({
  replies,
  hasVoice = true,
  shouldFinishSpeaking = true,
  answerDelay = 0,
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
    if (answerDelay > 0) await new Promise((resolve) => setTimeout(resolve, answerDelay));
    if (reply && "status" in reply) return new Response("{}", { status: reply.status });

    return Response.json({
      choices: [{ message: { content: JSON.stringify({ go: null, ...reply }) } }],
    });
  });
  vi.stubGlobal("fetch", fetchStub);

  const players: FakeVoiceAudio[] = [];
  class FakeVoiceAudio extends EventTarget {
    #src = "";
    paused = true;
    pause = vi.fn(() => {
      this.paused = true;
    });
    play = vi.fn(async () => {
      this.paused = false;
      if (shouldFinishSpeaking) queueMicrotask(() => this.dispatchEvent(new Event("ended")));
    });

    // A source given here is the silent clip that unlocks the voice on a tap, not a line.
    constructor(src = "") {
      super();
      this.#src = src;
    }

    get src() {
      return this.#src;
    }

    set src(src: string) {
      this.#src = src;
      if (src.startsWith("data:audio") && !players.includes(this)) players.push(this);
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

// A stuck turn never ends, not even on stop or abort, as iOS's recognizer sometimes does.
type Hearing = { text: string } | { error: string } | { stuck: true };

export function stubSpeechRecognition(hearings: readonly Hearing[]) {
  let hearingIndex = 0;
  const recognizers: FakeRecognition[] = [];

  class FakeRecognition extends EventTarget {
    lang = "";
    continuous = true;
    interimResults = true;
    maxAlternatives = 0;
    onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    isStuck = false;
    stop = vi.fn(() => {
      if (!this.isStuck) this.onend?.();
    });
    abort = vi.fn(() => {
      if (!this.isStuck) this.onend?.();
    });
    start = vi.fn(() => {
      const hearing = hearings[Math.min(hearingIndex, hearings.length - 1)];
      hearingIndex += 1;
      if (hearing && "stuck" in hearing) {
        this.isStuck = true;
        return;
      }
      queueMicrotask(() => {
        if (hearing && "text" in hearing)
          this.onresult?.({ results: [[{ transcript: hearing.text }]] });
        if (hearing && "error" in hearing) this.onerror?.({ error: hearing.error });
        this.onend?.();
      });
    });

    constructor() {
      super();
      recognizers.push(this);
    }
  }
  vi.stubGlobal("SpeechRecognition", FakeRecognition);

  return recognizers;
}
