import { h, ref } from '../../lib/mini-vue3.esm.js'
import { prevChildren, nextChildren } from './ArrayToArray.js'

export const App = {
  setup(){
    const isChanged = ref(false)

    function handleChange(){
    	console.log('handleChange:')
      isChanged.value = true
    }

    return {
      isChanged,
      change: handleChange
    }
  },

  render(){
    return h(
      'div',
      {
        id: 'root',
        onClick: this.change,
        class: ['red', 'hard']
      },
      // this.isChanged ? 'New Text' : 'Old Text'
      // this.isChanged ? 'New Text' : [h('p', {}, 'Hello'),h('p', {}, 'World')]
      // this.isChanged ? [h('p', {}, 'Hello'), h('p', {}, 'World')] : 'Old Text'
      this.isChanged ? nextChildren : prevChildren
    )
  },
}