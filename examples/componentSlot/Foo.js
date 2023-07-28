import { h, renderSlots } from '../../lib/mini-vue3.esm.js'

export const Foo = {
  setup(){
  },
  render(){
    console.log(this.$slots)
    const age = 18
    // return h('div', { id: 'foo' }, [renderSlots(this.$slots)]) // 不支持
    return h('div', { id: 'foo' }, [renderSlots(this.$slots, 'header', { age }), renderSlots(this.$slots, 'footer')])
  }
}