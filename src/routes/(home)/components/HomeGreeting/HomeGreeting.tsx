import { useState } from "react";

import { messages } from "./messages";

export function HomeGreeting() {
  const [step, setStep] = useState(0);

  const greeting = messages.greetings[step % messages.greetings.length];
  const previousGreeting =
    step > 0 ? messages.greetings[(step - 1) % messages.greetings.length] : null;

  function handleAnimationIteration() {
    setStep((currentStep) => currentStep + 1);
  }

  return (
    <span
      aria-hidden="true"
      className="grid items-center justify-items-center *:col-start-1 *:row-start-1"
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
