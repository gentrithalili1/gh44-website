interface StepItemProps {
  name: string;
  text: string;
  children?: React.ReactNode;
}

// One step on the timeline: a dot on the rule, its name, what to do, and its code if it has any.
export function StepItem({ name, text, children }: StepItemProps) {
  return (
    <li className="relative pb-5 pl-5.5 before:absolute before:top-2 before:-left-1 before:size-1.75 before:rounded-full before:bg-accent last:pb-0">
      <dfn className="block font-medium not-italic">{name}</dfn>
      <span className="text-label text-muted">{text}</span>
      {children ? <div className="mt-3">{children}</div> : null}
    </li>
  );
}
