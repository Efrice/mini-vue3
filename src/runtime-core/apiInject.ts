import { getCurrentInstance } from ".";
import { isFunction } from "../shared";

export function provide(key: string, value: string){
  const currentInstance: any = getCurrentInstance()
  if(currentInstance){
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent?.provides

    if(provides === parentProvides){
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

export function inject(key: string, defaultValue){
  const currentInstance: any = getCurrentInstance()
  if(currentInstance){
    const parentProvides = currentInstance.parent.provides

    if(key in parentProvides){
      return parentProvides[key]
    }else if(defaultValue){
      return isFunction(defaultValue) ? defaultValue() : defaultValue
    }
  }
}
