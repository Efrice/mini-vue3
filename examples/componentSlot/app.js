import { h, createTextVNode } from '../../lib/mini-vue3.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render(){
    const app = h('p', {}, 'app')
    // const foo = h(Foo, {}, [ h('span', {}, '123') ])
    // const foo = h(Foo, {},  h('span', {}, '123')) // 当前无法解决该场景
    // const foo = h(Foo, {}, [h('span', {}, '123'), h('span', {}, '456')])
    // const foo = h(Foo, {}, { header:  h('span', {}, 'header'), footer: h('span', {}, 'footer') }) 
    const foo = h(Foo, {}, { header: ({ age }) => [h('p', {}, 'header' + age), createTextVNode('你好')], footer: () => h('p', {}, 'footer') }) // 当前仅支持传入对象且 slot 对应值需为函数的写法
    return h(
      'div', {}, [app, foo]
    )
  },

  setup(){
    return {
      msg: 'hi'
    }
  }
}