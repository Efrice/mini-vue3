import { h } from '../../lib/mini-vue3.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render(){
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard']
      },
      [h('p', { class: 'red' }, 'hi'), h(Foo, { count: 1 })]
      // [h(
      //   'p',
      //   {
      //     class: 'red',
      //     onClick(){
      //       console.log(this)
      //     }
      //   }, 
      //   'hi'), 
      //   h('p',
      //    {
      //     class: ['red', 'blue'],
      //     onMouseenter(){
      //       console.log('hover')
      //     }
      //    },
      //     this.msg)]
    )
  },

  setup(){
    return {
      msg: 'world1'
    }
  }
}