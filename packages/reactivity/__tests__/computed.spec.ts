import { computed } from "../src/computed"
import { reactive } from "../src/reactive"
import { vi } from "vitest"

describe("computed", () => {
  it("happy pass", () => {
    const user = reactive({
      age: 18,
    })

    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(18)
  })

  it("should compute lazily and cache", () => {
    const user = reactive({
      age: 18,
    })

    const getter = vi.fn(() => {
      return user.age
    })

    const cUser = computed(getter)

    // lazy
    expect(getter).toBeCalledTimes(0)

    expect(cUser.value).toBe(18)
    expect(getter).toBeCalledTimes(1)

    // cache
    expect(cUser.value).toBe(18)
    expect(getter).toBeCalledTimes(1)

    // should compute
    user.age = 20
    expect(cUser.value).toBe(20)
    expect(getter).toBeCalledTimes(2)

    // should not compute
    expect(cUser.value).toBe(20)
    expect(getter).toBeCalledTimes(2)
  })
})
