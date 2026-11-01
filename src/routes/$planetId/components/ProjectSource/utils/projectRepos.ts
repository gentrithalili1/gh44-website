export const PROJECT_REPOS = {
  "gh44-brain": {
    path: "gentrithalili1/gh44-brain",
    href: "https://github.com/gentrithalili1/gh44-brain",
  },
  "gh44-theme": {
    path: "gentrithalili1/gh44-theme",
    href: "https://github.com/gentrithalili1/gh44-theme",
  },
  "gh44-confirm": {
    path: "gentrithalili1/react-promise-confirmation-dialog",
    href: "https://github.com/gentrithalili1/react-promise-confirmation-dialog",
  },
} as const;

export type ProjectId = keyof typeof PROJECT_REPOS;
