class ReactiveEffect {
  private _fn: any
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    activeEffect = this
    return this._fn()
  }
}

const targetMap = new Map()
export function track(target, key){
  // targetMap -> target -> key -> dep
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

  dep.add(activeEffect)
}

export function trigger(target, key){
  // targetMap -> target -> key -> dep
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

let activeEffect: any // reactiveEffect instance
export function effect(fn, options: any = {}){
  const { scheduler } = options
  const _effect = new ReactiveEffect(fn, scheduler)

  _effect.run()

  return _effect.run.bind(_effect)
}
