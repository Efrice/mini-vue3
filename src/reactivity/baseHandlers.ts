import { isObject } from '../shared'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false){
  return function get(target, key){
    if(key === ReactiveFlags.IS_REACTIVE){
      return !isReadonly
    }

    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }

    if(!isReadonly){
      track(target, key)
    }

    const res = Reflect.get(target,key)

    if(isObject(res)){
      return isReadonly? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetter(){
  return function set(target, key, value){
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandler = {
  get,
  set
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target, key){
    console.warn(`${key} can't set, ${target} is readonly`)
    return true
  }
}