export const messages = {
  stepsLabel: "use gh44-confirm",
  steps: {
    confirmInstall: { name: "install", text: "add the package.", tab: "terminal" },
    confirmProvider: {
      name: "wrap",
      text: "wrap the app in the provider, once. it renders the dialog.",
      tab: "index.tsx",
    },
    confirmUsage: {
      name: "await",
      text: "await confirm() where you ask. it resolves on yes and rejects on no.",
      tab: "App.tsx",
    },
  },
} as const;
