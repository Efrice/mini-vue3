import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent){
  return {
    mount(rootSelector){
      const rootContainer = document.querySelector(rootSelector)
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}
