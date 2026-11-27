import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Match Next.js automatic JSX runtime for component acceptance tests.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "lib/**/__tests__/**/*.test.ts",
      "components/**/*.test.ts",
      "components/**/__tests__/**/*.test.ts",
      "sections/**/__tests__/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
