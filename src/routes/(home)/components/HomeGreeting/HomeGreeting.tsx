import { useState } from "react";

import { pickRandomIndex } from "#/utils/pickRandomIndex";

import { messages } from "./messages";

type GreetingTurn = {
  index: number;
  previousIndex: number | null;
};

// English first, so the server and the client render the same greeting.
const FIRST_TURN: GreetingTurn = { index: 0, previousIndex: null };

export function HomeGreeting() {
  const [turn, setTurn] = useState(FIRST_TURN);

  const greeting = messages.greetings[turn.index];
  const previousGreeting =
    turn.previousIndex === null ? null : messages.greetings[turn.previousIndex];

  function handleAnimationIteration() {
    setTurn((currentTurn) => ({
      index: pickRandomIndex({
        count: messages.greetings.length,
        excludeIndex: currentTurn.index,
      }),
      previousIndex: currentTurn.index,
    }));
  }

  return (
    <span
      aria-hidden="true"
      className="grid items-center justify-items-start *:col-start-1 *:row-start-1"
    >
      {messages.greetings.map((sizingGreeting) => (
        <span key={sizingGreeting.lang} lang={sizingGreeting.lang} dir="auto" className="invisible">
          {sizingGreeting.text}
        </span>
      ))}
      {previousGreeting ? (
        <span
          key={`out-${previousGreeting.lang}`}
          lang={previousGreeting.lang}
          dir="auto"
          className="animate-greeting-out"
        >
          {previousGreeting.text}
        </span>
      ) : null}
      <span
        lang={greeting.lang}
        dir="auto"
        onAnimationIteration={handleAnimationIteration}
        className="animate-greeting-in motion-reduce:animate-none"
      >
        {greeting.text}
      </span>
    </span>
  );
}
