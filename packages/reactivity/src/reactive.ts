import { isObject } from "@mini-vue3/shared"
import {
  mutableHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandlers"

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

function createProxy(raw, baseHandler) {
  if (!isObject(raw)) {
    console.warn(`Proxy target must be a object`)
    return raw
  }
  return new Proxy(raw, baseHandler)
}

export function reactive(raw) {
  return createProxy(raw, mutableHandler)
}

export function readonly(raw) {
  return createProxy(raw, readonlyHandler)
}

export function shallowReadonly(raw) {
  return createProxy(raw, shallowReadonlyHandler)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
