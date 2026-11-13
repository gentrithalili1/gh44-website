import { useExplorer } from "#/hooks/useExplorer";

interface PageLayerProps {
  children: React.ReactNode;
}

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
