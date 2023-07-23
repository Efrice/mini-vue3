import { mutableHandler, readonlyHandler } from "./baseHandlers"

function creatProxy(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}

export function reactive(raw){
  return creatProxy(raw, mutableHandler)
}

export function readonly(raw){
  return creatProxy(raw, readonlyHandler)
}