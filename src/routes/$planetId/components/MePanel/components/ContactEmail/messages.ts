export const messages = {
  copyLabel: "copy email address",
  copiedText: "copied. talk soon.",
  failedText: (email: string) => `couldn't copy. it's ${email}`,
  copiedLabel: "email address copied",
  failedLabel: "couldn't copy the email address",
} as const;
