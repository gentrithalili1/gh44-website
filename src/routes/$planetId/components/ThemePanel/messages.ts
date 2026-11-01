export const messages = {
  installLabel: "install gh44-theme",
  installNotes: {
    zed: "zed: extensions in the command palette, search gh44 and install. then in settings.json:",
    warp: "from a clone of gh44-theme, on macos. then settings → appearance → themes → gh44 dark.",
    slack:
      "preferences → appearance → custom theme → import theme → paste your legacy theme colors:",
    linear:
      "settings → preferences → interface theme → custom → import theme, and paste gh44 dark:",
    chrome:
      "then chrome://extensions → developer mode → load unpacked → chrome/gh44-dark. arc, brave and edge too.",
    github: "install stylus, open this link and click install style:",
    shadcn:
      "in a project that ran shadcn init. with @gh44 in components.json registries: npx shadcn@latest add @gh44/gh44",
  },
} as const;
