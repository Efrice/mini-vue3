import { h, getCurrentInstance } from "../../packages/vue/dist/mini-vue3.esm.js"

export const Foo = {
  setup() {
    const instance = getCurrentInstance()
    console.log("Foo instance:", instance)
  },
  render() {
    return h("div", {}, "foo")
  },
}
