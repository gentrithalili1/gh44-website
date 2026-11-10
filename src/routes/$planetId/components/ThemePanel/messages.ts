// Each app's install steps, from its README in gh44-theme. `code` names the step's snippets,
// one code tab each.
export const messages = {
  appsLabel: "apps",
  stepsLabel: (app: string) => `install gh44 in ${app}`,
  apps: {
    zed: [
      {
        id: "install",
        name: "install",
        text: "run zed: extensions, search gh44 and install it.",
      },
      {
        id: "pick",
        name: "pick",
        text: "run theme selector: toggle and pick gh44 dark or gh44 light.",
      },
      {
        id: "settings",
        name: "settings",
        text: "optional: follow the system mode and use lilex and ibm plex sans, which zed bundles.",
        code: [{ snippet: "zedSettings", label: "settings.json" }],
      },
    ],
    warp: [
      {
        id: "copy",
        name: "copy",
        text: "from a clone of gh44-theme, copy the themes into warp's themes folder. on macos:",
        code: [{ snippet: "warpCopy", label: "terminal" }],
      },
      {
        id: "pick",
        name: "pick",
        text: "settings → appearance → themes → gh44 dark or gh44 light. restart warp if they don't show up.",
      },
      {
        id: "font",
        name: "font",
        text: "install lilex from fonts/ and pick it under settings → appearance → text.",
      },
    ],
    slack: [
      {
        id: "mode",
        name: "mode",
        text: "preferences → appearance: set the color mode to match the line you paste.",
      },
      {
        id: "import",
        name: "import",
        text: "custom theme → import theme → paste your legacy theme colors.",
      },
      {
        id: "paste",
        name: "paste",
        text: "paste a line and click apply. slack keeps one custom theme: paste the other one when you switch modes.",
        code: [
          { snippet: "slackDark", label: "gh44 dark" },
          { snippet: "slackLight", label: "gh44 light" },
        ],
      },
    ],
    linear: [
      {
        id: "custom",
        name: "custom",
        text: "settings → preferences → interface theme → custom.",
      },
      {
        id: "import",
        name: "import",
        text: "import theme, paste a line and confirm. linear keeps one custom theme: import the other one when you switch modes.",
        code: [
          { snippet: "linearDark", label: "gh44 dark" },
          { snippet: "linearLight", label: "gh44 light" },
        ],
      },
      {
        id: "code",
        name: "code blocks",
        text: "for code and diffs in zed's colors: install stylus, open the userstyle and click install style. browser only.",
        code: [{ snippet: "linearStyle", label: "userstyle" }],
      },
    ],
    chrome: [
      {
        id: "clone",
        name: "clone",
        text: "clone or download gh44-theme.",
        code: [{ snippet: "chromeClone", label: "terminal" }],
      },
      {
        id: "developer",
        name: "developer mode",
        text: "open chrome://extensions and turn on developer mode.",
      },
      {
        id: "load",
        name: "load",
        text: "load unpacked → chrome/gh44-dark or chrome/gh44-light. arc, brave and edge too.",
      },
    ],
    github: [
      {
        id: "stylus",
        name: "stylus",
        text: "install stylus in the browser.",
      },
      {
        id: "install",
        name: "install",
        text: "open the userstyle and click install style.",
        code: [{ snippet: "githubStyle", label: "userstyle" }],
      },
      {
        id: "reload",
        name: "reload",
        text: "reload github. it follows github's appearance, sync with system too.",
      },
    ],
    shadcn: [
      {
        id: "add",
        name: "add",
        text: "in a project that ran shadcn init: colors, ibm plex sans and lilex.",
        code: [{ snippet: "shadcnAdd", label: "terminal" }],
      },
      {
        id: "colors",
        name: "colors only",
        text: "or keep your own fonts and take only the colors.",
        code: [{ snippet: "shadcnColors", label: "terminal" }],
      },
      {
        id: "dark",
        name: "dark mode",
        text: 'class="dark" on <html> turns dark mode on.',
      },
    ],
  },
} as const;
