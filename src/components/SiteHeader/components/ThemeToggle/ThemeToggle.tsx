import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "#/components/ui/button";

import { useTheme } from "./hooks/useTheme";
import { messages } from "./messages";

export function ThemeToggle() {
  const themeState = useTheme();

  const label =
    themeState.theme === "dark" ? messages.switchToLightLabel : messages.switchToDarkLabel;

  // Both icons render and the `dark` class picks one, so the icon is right before hydration.
  return (
    <Button variant="ghost" size="icon-lg" aria-label={label} onClick={themeState.toggleTheme}>
      <MoonIcon aria-hidden className="size-6 dark:hidden" />
      <SunIcon aria-hidden className="hidden size-6 dark:block" />
    </Button>
  );
}
