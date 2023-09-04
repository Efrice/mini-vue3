import { h } from "../../packages/vue/dist/mini-vue3.esm.js"

export const Foo = {
  setup(props, { emit }) {
    const addEmit = () => {
      console.log(props, "emit")
      emit("add", 1, 2)
      emit("add-foo", 1, 2)
    }

    return {
      addEmit,
    }
  },
  render() {
    return h(
      "div",
      {
        onClick: this.addEmit,
      },
      "foo" + this.count
    )
  },
}
