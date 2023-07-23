import { extend } from "../shared"

class ReactiveEffect {
  private _fn: any
  private active = true
  public deps = []
  public scheduler: Function | undefined
  public onStop: Function | undefined

  constructor(fn) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    return this._fn()
  }

  stop(){
    if(this.active){
      cleanupEffect(this)
      if(this.onStop){
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
}

const targetMap = new Map()
export function track(target, key){
  // targetMap -> target -> depsMap -> key -> dep
  let depsMap = targetMap.get(target)
  if(!depsMap){
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep){
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffect(dep)
}

function trackEffect(dep: any) {
  // reactive when not effect, this activeEffect is null
  if(activeEffect && !dep.has(activeEffect)){
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key){
  // targetMap -> target -> depsMap -> key -> dep
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for (const effect of dep) {
    if(effect.scheduler){
      effect.scheduler()
    }else {
      effect.run()
    }
  }
}

let activeEffect: any = null // reactiveEffect instance
export function effect(fn, options: any = {}){
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner){
  runner.effect.stop()
}
