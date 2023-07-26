import { getEvent, isArray, isOn, isString, ShapeFlags } from "../shared"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container){
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  const { shapeFlag } = vnode

  if(shapeFlag & ShapeFlags.ELEMENT){
    processElement(vnode, container)
  }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const { type, props, shapeFlag, children } = vnode
  const el = vnode.el = document.createElement(type)

  setAttr(el, props)

  mountChildren(el, shapeFlag, children)

  container.append(el)
}

function setAttr(el, props) {
  for (const key in props) {
    const value = props[key]

    if(isOn(key)){
      el.addEventListener(getEvent(key), value)
    }

    if (isString(value)) {
      el.setAttribute(key, value)
    } else if (isArray(value)) {
      el.setAttribute(key, value.join(' '))
    }
  }
}

function mountChildren(el, shapeFlag, children) {
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach(v => patch(v, el))
  }
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  // vnode
  patch(subTree, container)

  vnode.el = subTree.el
}
