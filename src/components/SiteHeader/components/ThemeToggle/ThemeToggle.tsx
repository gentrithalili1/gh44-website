import { MoonIcon, SunIcon } from "lucide-react";

import { IconButton } from "../IconButton";
import { useTheme } from "./hooks/useTheme";
import { messages } from "./messages";

export function ThemeToggle() {
  const themeState = useTheme();

  const isDark = themeState.theme === "dark";

  return (
    <IconButton
      icon={isDark ? SunIcon : MoonIcon}
      label={isDark ? messages.switchToLightLabel : messages.switchToDarkLabel}
      onClick={themeState.toggleTheme}
    />
  );
}
