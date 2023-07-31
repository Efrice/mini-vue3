import { proxyRefs, shallowReadonly } from "../reactivity"
import { isObject } from "../shared"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceHandler } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: any, parent) {
  const component = {
    vnode,
    parent,
    isMounted: false,
    next: null,
    type: vnode.type,
    setupState: {},
    provides: parent?.provides || {},
    props: {},
    slots: {},
    subTree: {},
    emit: () => {},
    render: null
  }

  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance){
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const component = instance.type

  instance.proxy = new Proxy({ _: instance }, publicInstanceHandler)

  const { setup } = component

  if(setup){
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // object function
  if(isObject(setupResult)){
    instance.setupState = proxyRefs(setupResult)
  }

  finshComponentSetup(instance)
}

function finshComponentSetup(instance) {
  const component = instance.type

  if(component.render){
    instance.render = component.render
  }
}


let currentInstance = null
export function getCurrentInstance(){
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}
