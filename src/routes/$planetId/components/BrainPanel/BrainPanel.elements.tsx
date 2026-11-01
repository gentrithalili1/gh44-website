interface PanelSectionProps {
  heading: string;
  children: React.ReactNode;
}

export function PanelSection({ heading, children }: PanelSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs tracking-kicker text-faint">{heading}</h2>
      {children}
    </section>
  );
}

interface LearningStepProps {
  name: string;
  children: React.ReactNode;
}

export function LearningStep({ name, children }: LearningStepProps) {
  return (
    <li className="relative pb-4 pl-5.5 before:absolute before:top-2 before:-left-1 before:size-1.75 before:rounded-full before:bg-accent">
      <dfn className="block font-medium not-italic">{name}</dfn>
      <span className="text-label text-muted">{children}</span>
    </li>
  );
}
