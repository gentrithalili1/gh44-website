import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Its `main` is CommonJS inside a `"type": "module"` package, which Node refuses; Vite's
    // transform takes its ES module build, as the app build does.
    server: { deps: { inline: ["react-promise-confirmation-dialog"] } },
  },
});

export default config;
