class ReactiveEffect {
  private _fn: any
  private active = true
  public scheduler: Function | undefined
  public deps = []

  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    activeEffect = this
    return this._fn()
  }

  stop(){
    if(this.active){
      cleanupEffect(this)

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

  for (const ins of dep) {
    if(ins.scheduler){
      ins.scheduler()
    }else {
      ins.run()
    }
  }
}

let activeEffect: any = null // reactiveEffect instance
export function effect(fn, options: any = {}){
  const { scheduler } = options
  const _effect = new ReactiveEffect(fn, scheduler)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner){
  runner.effect.stop()
}
