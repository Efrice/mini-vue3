import { extend } from "@mini-vue3/shared"

export class ReactiveEffect {
  private _fn: any
  private active = true
  public deps = []
  public scheduler: Function | undefined
  public onStop: Function | undefined

  constructor(fn, scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active) {
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this
    const res = this._fn()

    shouldTrack = false

    return res
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }

      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new Map()
export function track(target, key) {
  // targetMap -> target -> depsMap -> key -> dep

  if (!isTracking()) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function isTracking() {
  // reactive when not effect, this activeEffect is null
  return shouldTrack && activeEffect !== null
}

export function trackEffects(dep: any) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key) {
  // targetMap -> target -> depsMap -> key -> dep
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  triggerEffects(dep)
}

export function triggerEffects(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

let activeEffect: any = null // reactiveEffect instance
let shouldTrack: boolean
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
