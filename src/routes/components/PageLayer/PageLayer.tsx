import { useExplorer } from "#/hooks/useExplorer";

interface PageLayerProps {
  children: React.ReactNode;
}

// The page over the system: its panel and controls. While the cockpit is open they fade out of
// the windshield's view and out of reach, and come back as it closes. A cockpit that only greets
// the visitor leaves the page readable.
export function PageLayer({ children }: PageLayerProps) {
  const explorer = useExplorer();

  const isHidden = explorer.cockpit.status === "open" && !explorer.cockpit.isGreeting;

  return (
    <div
      aria-hidden={isHidden ? true : undefined}
      inert={isHidden}
      className={`transition-[opacity,visibility] duration-300 ease-space ${isHidden ? "invisible opacity-0" : ""}`}
    >
      {children}
    </div>
  );
}
