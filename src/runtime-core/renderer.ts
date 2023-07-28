import { effect } from "../reactivity"
import { getEvent, isArray, isOn, isString, ShapeFlags } from "../shared"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container){
  patch(null, vnode, container)
}

function patch(n1, n2: any, container: any, parentComponent?) {
  const { type, shapeFlag } = n2

  switch (type) {
    case Fragment:
        processFragment(n1, n2, container, parentComponent)
      break;
    case Text:
        processText(n1, n2, container)
      break;  
    default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1, n2, container, parentComponent)
        }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
          processComponent(n1, n2, container, parentComponent)
        }
      break;
  }
}

function processFragment(n1, n2: any, container: any, parentComponent) {
  mountChildren(n2, container, parentComponent)
}

function processText(n1, n2: any, container: any) {
  const { children } = n2
  const textNode = n2.el = document.createTextNode(children)

  container.append(textNode)
}

function processElement(n1, n2, container, parentComponent) {
  if(!n1){
    mountElement(n2, container, parentComponent)
  }else {
    patchElement(n1, n2)
  }
}

function patchElement(n1, n2) {
  const prevProps = n1.props
  const nextProps = n2.props

  const el = n2.el = n1.el

  patchProps(el, prevProps, nextProps)
  patchChildren(el, n1, n2)
}

function patchProps(el, prevProps, nextProps) {
  for (const key in nextProps) {
    const prevProp = prevProps[key]
    const nextProp = nextProps[key]

    if(prevProp !== nextProp){
      setProp(el, key, prevProp, nextProp)
    }
  }

  for (const key in prevProps) {
    if(!(key in nextProps)){
      setProp(el, key, null, null)
    }
  }
}

function patchChildren(container, n1, n2) {
  const prevShapeFlag = n1.shapeFlag
  const nextShapeFlag = n2.shapeFlag

  if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN && nextShapeFlag & ShapeFlags.TEXT_CHILDREN){
    setElementText(container, n2.children)
  }
}

function setElementText(container, text) {
  container.textContent = text
}

function unmountChildren(children) {
  children.forEach(item => {
    const { el } = item
    remove(el)
  })
}

function remove(child) {
  const parent = child.parentNode
  if(parent){
    parent.removeChild(child)
  }
}

function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, shapeFlag, children } = vnode
  const el = vnode.el = document.createElement(type)

  setProps(el, props)

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }

  container.append(el)
}

function setProps(el, props) {
  for (const key in props) {
    const value = props[key]

    setProp(el, key, null, value)
  }
}

function setProp(el: any, key: string, prevValue: any, nextValue) {
  if (isOn(key)) {
    el.addEventListener(getEvent(key), nextValue)
  }

  if (isString(nextValue)) {
    el.setAttribute(key, nextValue)
  } else if (isArray(nextValue)) {
    el.setAttribute(key, nextValue.join(' '))
  }else if(nextValue === undefined || nextValue === null){
    el.removeAttribute(key)
  }
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => patch(null, v, container, parentComponent))
}

function processComponent(n1, n2, container, parentComponent) {
  mountComponent(n1, n2, container, parentComponent)
}

function mountComponent(n1, n2: any, container: any, parentComponent) {
  const instance = createComponentInstance(n2, parentComponent)

  setupComponent(instance)
  setupRenderEffect(instance, n2, container)
}

function setupRenderEffect(instance, vnode, container) {
  effect(()=>{
    if(!instance.isMounted){
      const { proxy } = instance
      const subTree = instance.render.call(proxy)
      instance.subTree = subTree
  
      patch(null, subTree, container, instance)
  
      vnode.el = subTree.el

      instance.isMounted = true
    }else {
      const { proxy } = instance
      const subTree = instance.render.call(proxy)
      const prevSubTree = instance.subTree
      instance.subTree = subTree
  
      patch(prevSubTree, subTree, container, instance)
  
      vnode.el = subTree.el
    }
  })
}
