import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    alias: { "@mini-vue3/*": "./packages/*/src" },
    include: ["./packages/**/__tests__/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
})
