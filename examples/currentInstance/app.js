import { h, getCurrentInstance } from "../../packages/vue/dist/mini-vue3.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [h("p", { class: "red" }, "app"), h(Foo)]
    )
  },

  setup() {
    const instance = getCurrentInstance()
    console.log("App instance:", instance)
  },
}
