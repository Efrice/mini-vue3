import { h } from '../../lib/mini-vue3.esm.js'

export const Child = {
  name: 'child',
  setup(){},
  render(){
    console.log('props.msg:', this.$props)
    return h('div', {}, [h('div', {}, 'child-props-msg-'+ this.$props.msg)])
  }
}