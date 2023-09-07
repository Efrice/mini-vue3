import { ReactiveEffect } from "@mini-vue3/reactivity"
import { queuePreFlushCb } from "./scheduler"

export function watchEffect(source) {
  function job() {
    effet.run()
  }

  let cleanup
  function onCleanup(fn) {
    cleanup = effet.onStop = () => fn()
  }

  function getter() {
    if (cleanup) {
      cleanup()
    }
    source(onCleanup)
  }

  const effet = new ReactiveEffect(getter, () => {
    queuePreFlushCb(job)
  })

  effet.run()

  return () => effet.stop()
}
