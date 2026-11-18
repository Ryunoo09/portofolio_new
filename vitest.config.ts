import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    // Pick the browser build (React client hooks, matchMedia-aware shims) over SSR.
    conditions: ["browser"],
  },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Component tests need a DOM; data/env tests run here too, they just ignore it.
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
  },
});
