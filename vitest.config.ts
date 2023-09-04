import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    include: ["./packages/**/__tests__/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
})
