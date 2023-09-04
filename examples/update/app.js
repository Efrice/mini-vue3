import { h, ref } from "../../packages/vue/dist/mini-vue3.esm.js"

export const App = {
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
      console.log("count.value:", count, count.value)
    }

    const props = ref({
      foo: "foo",
      bar: "bar",
    })

    function onChangeProps1() {
      props.value.foo = "new-foo"
    }

    function onChangeProps2() {
      props.value.foo = undefined
    }

    function onChangeProps3() {
      props.value = {
        foo: "foo",
        baz: "baz",
      }
    }

    return {
      count,
      increment,
      onChangeProps1,
      onChangeProps2,
      onChangeProps3,
      props,
    }
  },

  render() {
    return h(
      "div",
      {
        id: "root",
        ...this.props,
        class: ["red", "hard"],
      },
      // 'shi' + this.count
      [
        h("button", { class: "red", onClick: this.increment }, "increment"),
        h("button", { class: "red", onClick: this.onChangeProps1 }, "change"),
        h("button", { class: "red", onClick: this.onChangeProps2 }, "delete"),
        h("button", { class: "red", onClick: this.onChangeProps3 }, "reset"),
        h("p", { class: "blue" }, "count -- " + this.count),
      ]
    )
  },
}
