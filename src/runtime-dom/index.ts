import { createRenderer } from '../runtime-core'
import { getEvent, isArray, isOn, isString } from '../shared'

function createElement(type){
  return document.createElement(type)
}

function patchProp(el, key, vlaue){
  if (isOn(key)) {
    el.addEventListener(getEvent(key), vlaue)
  }

  if (isString(vlaue)) {
    el.setAttribute(key, vlaue)
  } else if (isArray(vlaue)) {
    el.setAttribute(key, vlaue.join(' '))
  }else if(vlaue === undefined || vlaue === null){
    el.removeAttribute(key)
  }
}

export function insert(el, parent, anchor = null){
  parent.insertBefore(el, anchor)
}

export function remove(child) {
  const parent = child.parentNode
  if(parent){
    parent.removeChild(child)
  }
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args){
  return renderer.createApp(...args)
}

export * from '../runtime-core'
