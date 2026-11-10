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
