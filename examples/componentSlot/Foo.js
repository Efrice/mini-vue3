import { h, renderSlots } from "../../packages/vue/dist/mini-vue3.esm.js"

export const Foo = {
  setup() { },
  render() {
    const bar = h("p", {}, "foo")
    console.log(this.$slots)
    const age = 18
    // return h('div', { id: 'foo' }, [renderSlots(this.$slots)]) // 不支持
    return h("div", { id: "foo" }, [
      renderSlots(this.$slots, "header", { age }),
      bar,
      renderSlots(this.$slots, "footer"),
    ])
  },
}
