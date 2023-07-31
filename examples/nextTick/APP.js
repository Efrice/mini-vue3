import { h, ref, getCurrentInstance, nextTick } from '../../lib/mini-vue3.esm.js'

export const App = {
  setup(){
    const count = ref(1)
    const ins = getCurrentInstance()
    function changeCount(){
      for (let i = 0; i < 20; i++) {
        count.value++
      }
      console.log(ins)

      nextTick(() => {
        console.log(ins)
      })
    }

    return {
      count,
      changeCount
    }
  },

  render(){
    return h(
      'div',
      {
        id: 'root',
      },
      [h('p', { onClick: this.changeCount }, 'changeCount'), h('p', {}, `count -- ${this.count}`)]
    )
  }
}