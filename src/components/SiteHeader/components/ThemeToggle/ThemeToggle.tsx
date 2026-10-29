import { MoonIcon, SunIcon } from "lucide-react";

import { IconButton } from "../IconButton";
import { useTheme } from "./hooks/useTheme";
import { messages } from "./messages";

export function ThemeToggle() {
  const themeState = useTheme();

  const label =
    themeState.theme === "dark" ? messages.switchToLightLabel : messages.switchToDarkLabel;

  // Both icons render and the `dark` class picks one, so the icon is right before hydration.
  return (
    <IconButton label={label} onClick={themeState.toggleTheme}>
      <MoonIcon aria-hidden className="dark:hidden" />
      <SunIcon aria-hidden className="hidden dark:block" />
    </IconButton>
  );
}
