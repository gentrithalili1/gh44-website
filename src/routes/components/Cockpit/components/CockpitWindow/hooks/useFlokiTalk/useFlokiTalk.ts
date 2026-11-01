import { useEffect, useRef, useState } from "react";

import type { Destination } from "#/utils/destinations";

import { messages } from "../../components/CockpitTerminal/messages";
import type { Floki, FlokiFailureReason, FlokiHearing, FlokiOutcome } from "../useFloki";
import type { Terminal } from "../useTerminal";

// Two turns in a row with nothing heard end a conversation.
const MAX_QUIET_TURNS = 2;

type UseFlokiTalkParams = {
  floki: Floki;
  terminal: Terminal;
  onGo: (destination: Destination) => void;
};

function getFlokiFailure(reason: FlokiFailureReason) {
  switch (reason) {
    case "busy":
      return messages.floki.busy;
    case "questionLimit":
      return messages.floki.questionLimit;
    case "rateLimited":
      return messages.floki.rateLimited;
    case "unavailable":
      return messages.floki.unavailable;
    default: {
      const unknownReason: never = reason;
      return unknownReason;
    }
  }
}

// What Floki says to an outcome; nothing when he was stopped while thinking.
function getFlokiLine(outcome: FlokiOutcome) {
  switch (outcome.status) {
    case "answered":
      return outcome.say;
    case "navigating":
      return messages.floki.courseSet(outcome.destination.name);
    case "humorSet":
      return messages.floki.humorSet(outcome.humor);
    case "cancelled":
      return undefined;
    case "failed":
      return getFlokiFailure(outcome.reason);
    default: {
      const unknownOutcome: never = outcome;
      return unknownOutcome;
    }
  }
}

// What Floki prints when a turn at the mic gave no question; nothing when it did.
function getHearingLine(hearing: FlokiHearing) {
  switch (hearing.status) {
    case "heard":
      return undefined;
    case "quiet":
    case "failed":
      return messages.floki.goingQuiet;
    case "denied":
      return messages.floki.micDenied;
    default: {
      const unknownHearing: never = hearing;
      return unknownHearing;
    }
  }
}

// Talking with Floki in the cockpit: typed questions, and conversations started from his
// screen. His lines print in the terminal, he says them out loud, and he flies once he has said
// where.
export function useFlokiTalk({ floki, terminal, onGo }: UseFlokiTalkParams) {
  // A conversation goes on, turn after turn, until it ends; a newer one replaces it.
  const [conversation, setConversation] = useState<"off" | "on">("off");
  const conversationIdRef = useRef(0);

  // Closing the cockpit ends the conversation.
  useEffect(() => {
    return () => {
      conversationIdRef.current += 1;
    };
  }, []);

  function endConversation() {
    conversationIdRef.current += 1;
    setConversation("off");
  }

  // Floki answers on screen and out loud, and flies once he has said it. Returns whether the
  // conversation can go on.
  async function ask(question: string) {
    const outcome = await floki.ask(question);
    const line = getFlokiLine(outcome);
    if (line === undefined) return false;
    terminal.print([{ kind: "floki", text: line }]);
    if (outcome.status === "failed") return false;
    // Cut off by a newer question, a typed go or closing the cockpit: that decides instead.
    if ((await floki.speak(line)) === "interrupted") return false;
    const destination =
      outcome.status === "answered" || outcome.status === "navigating"
        ? outcome.destination
        : undefined;
    if (!destination) return true;
    onGo(destination);
    return false;
  }

  // Talk starts a conversation: Floki listens, answers, and listens again, until the visitor
  // taps stop, he flies somewhere, or he hears nothing twice in a row. He never listens while
  // he speaks, so he can't hear himself.
  async function talk() {
    if (conversation === "on") {
      endConversation();
      floki.stop();
      floki.stopListening();
      return;
    }
    conversationIdRef.current += 1;
    const conversationId = conversationIdRef.current;
    function isCurrent() {
      return conversationId === conversationIdRef.current;
    }
    setConversation("on");
    // Stopped during the greeting: the mic stays closed.
    if (!floki.hasGreeted && (await floki.greet(messages.floki.spokenGreeting)) === "interrupted") {
      return;
    }
    let quietTurns = 0;
    while (isCurrent()) {
      const hearing = await floki.listen();
      if (!isCurrent()) return;
      if (hearing.status === "heard") {
        quietTurns = 0;
        terminal.print([{ kind: "visitor", text: hearing.text }]);
        if (!(await ask(hearing.text))) break;
        continue;
      }
      if (hearing.status !== "denied") quietTurns += 1;
      if (hearing.status === "denied" || quietTurns >= MAX_QUIET_TURNS) {
        terminal.print([
          { kind: "floki", text: getHearingLine(hearing) ?? messages.floki.goingQuiet },
        ]);
        break;
      }
    }
    if (isCurrent()) endConversation();
  }

  // The visitor takes the controls (a typed go, a destination click): Floki stops, and his
  // pending answer can't fly anywhere else.
  function takeControls() {
    endConversation();
    floki.stop();
    floki.stopListening();
  }

  return { isConversing: conversation === "on", ask, talk, takeControls };
}
