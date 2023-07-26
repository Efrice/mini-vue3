import { hasOwn } from "../shared"

const publicPropertiesMap = {
  $el: i => i.vnode.el
}

export const publicInstanceHandler = {
  get({ _: instance }, key){
    const { setupState, props } = instance

    if(hasOwn(setupState, key)){
      return setupState[key]
    }else if(hasOwn(props, key)){
      return props[key]
    }

    if(key === '$el'){
      return publicPropertiesMap['$el'](instance)
    }
  }
}
