import { shallowReadonly } from "../reactivity/reactive"
import { isObject } from "../shared"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceHandler } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
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
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // object function
  if(isObject(setupResult)){
    instance.setupState = setupResult
  }

  finshComponentSetup(instance)
}

function finshComponentSetup(instance) {
  const component = instance.type

  if(component.render){
    instance.render = component.render
  }
}
