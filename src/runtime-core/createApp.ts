import { createVNode } from "./vnode"

export function createAppAPI(render){
  return function createApp(rootComponent){
    return {
      mount(rootSelector){
        const rootContainer = document.querySelector(rootSelector)
        const vnode = createVNode(rootComponent)

        render(vnode, rootContainer)
      }
    }
  }
}
