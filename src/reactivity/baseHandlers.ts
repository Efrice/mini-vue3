import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(readonly = false){
  return function get(target, key){
    if(!readonly){
      track(target, key)
    }
    return Reflect.get(target,key)
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