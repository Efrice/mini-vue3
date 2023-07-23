import { mutableHandler, readonlyHandler } from "./baseHandlers"

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

function creatProxy(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}

export function reactive(raw){
  return creatProxy(raw, mutableHandler)
}

export function readonly(raw){
  return creatProxy(raw, readonlyHandler)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY]
}
