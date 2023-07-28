import { createApp, h, provide, inject } from '../../lib/mini-vue3.esm.js'

const Provide = {
  name: 'Provide',
  setup(){
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render(){
    return h('div', {}, [h('p', {}, 'Provide'), h(Provide2)])
  }
}

const Provide2 = {
  name: 'Provide2',
  setup(){
    provide('foo', 'fooVal2')

    const foo = inject('foo')
    return {
      foo
    }
  },
  render(){
    return h('div', {}, [h('p', {}, `Provide2 -- ${this.foo}`), h(Inject)])
  }
}

const Inject = {
  name: 'Inject',
  setup(){
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'baz')

    return {
      foo,
      bar,
      baz
    }
  },
  render(){
    return h('div', {}, `Inject -- ${this.foo} -- ${this.bar} -- ${this.baz}`)
  }
}

createApp(Provide).mount('#app')
