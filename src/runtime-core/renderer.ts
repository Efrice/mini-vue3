import { getEvent, isArray, isOn, isString, ShapeFlags } from "../shared"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container){
  patch(vnode, container)
}

function patch(vnode: any, container: any, parentComponent?) {
  const { type, shapeFlag } = vnode

  switch (type) {
    case Fragment:
        processFragment(vnode, container, parentComponent)
      break;
    case Text:
        processText(vnode, container)
      break;  
    default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(vnode, container, parentComponent)
        }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
          processComponent(vnode, container, parentComponent)
        }
      break;
  }
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)

  container.append(textNode)
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, shapeFlag, children } = vnode
  const el = vnode.el = document.createElement(type)

  setAttr(el, props)

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }

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

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => patch(v, container, parentComponent))
}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(vnode: any, container: any, parentComponent) {
  const instance = createComponentInstance(vnode, parentComponent)

  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  // vnode
  patch(subTree, container, instance)

  vnode.el = subTree.el
}
