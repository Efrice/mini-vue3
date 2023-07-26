import { h } from '../../lib/mini-vue3.esm.js'

export const Foo = {
  setup(props){
    props.count++
    console.log(props)
  },
  render(){
    return h('div', {}, 'foo' + this.count)
  }
}