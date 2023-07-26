import { shallowReadonly } from "../reactivity/reactive"
import { isObject } from "../shared"
import { initProps } from "./componentProps"
import { publicInstanceHandler } from "./componentPublicInstance"

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    render: null
  }

  return component
}

export function setupComponent(instance){
  // TODO
  // initSlots

  initProps(instance, instance.vnode.props)

  setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: any) {
  const component = instance.type

  instance.proxy = new Proxy({ _: instance }, publicInstanceHandler)

  const { setup } = component

  if(setup){
    const setupResult = setup(shallowReadonly(instance.props))

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
