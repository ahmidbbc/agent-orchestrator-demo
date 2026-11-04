import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the "@/*" path alias from tsconfig.json.
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
  },
})
