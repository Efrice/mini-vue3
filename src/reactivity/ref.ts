import { equal, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

export class RefImpl {
  private _rawValue: any
  private _value: any
  private dep: Set<unknown>
  private __v_isRef: boolean

  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.__v_isRef = true
    this.dep = new Set()
  }

  get value(){
    if(isTracking()){
      trackEffects(this.dep)
    }
    return this._value
  }

  set value(newValue){
    if(equal(newValue, this._rawValue)) return
    this._rawValue = newValue
    this._value = convert(newValue)
    triggerEffects(this.dep)
  }
}

function convert(value){
  return isObject(value) ? reactive(value) : value
}

export function ref(value){
  return new RefImpl(value)
}

export function isRef(ref){
  return !!ref.__v_isRef
}

export function unRef(ref){
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRef){
  return new Proxy(objectWithRef, {
    get(target, key){
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value){
      if(isRef(target[key]) && !isRef(value)){
        return target[key].value = value
      }else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
