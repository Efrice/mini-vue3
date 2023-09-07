import { reactive } from "@mini-vue3/reactivity"
import { nextTick } from "../src/scheduler"
import { watchEffect } from "../src/apiWatch"

describe("watch effect", () => {
  it("effect", async () => {
    const state = reactive({ count: 0 })
    let dummy

    watchEffect(() => {
      dummy = state.count
    })

    expect(dummy).toBe(0)

    state.count++
    await nextTick()

    expect(dummy).toBe(1)
  })

  it("stopping the watcher", async () => {
    const state = reactive({ count: 0 })
    let dummy

    let stop: any = watchEffect(() => {
      dummy = state.count
    })

    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()

    expect(dummy).toBe(0)
  })

  it("cleanup registration", async () => {
    const state = reactive({ count: 0 })
    const cleanup = vi.fn()
    let dummy

    let stop: any = watchEffect((onCleanup) => {
      onCleanup(cleanup)
      dummy = state.count
    })

    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toBeCalledTimes(1)
    expect(dummy).toBe(1)

    // stop()
    // expect(cleanup).toBeCalledTimes(2)
  })
})
