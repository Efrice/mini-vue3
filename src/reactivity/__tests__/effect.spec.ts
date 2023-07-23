import { effect, stop } from "../effect"
import { reactive } from "../reactive"
import { vi } from 'vitest'

describe('effect', () => {
  it('happy pass', () => {
    const user = reactive({
      age: 18
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(19)

    user.age++

    expect(nextAge).toBe(20)
  })

  it('should return runner when call effect', ()=>{
    let age = 18

    const runner = effect(()=>{
      age++
      return 'age'
    })
    
    expect(age).toBe(19)
    const res = runner()
    expect(age).toBe(20)
    expect(res).toBe('age')
  })

  it('scheduler', ()=>{
    // 1. effect function receive second param options
    // 2. scheduler is a function
    // 3. effect first call will get the fn call
    // 4. obj.foo updated, the fn will not call, scheduler will call, trigger
    // 5. effect return function call, fn will call, return the fn

    let dummy
    let run

    const scheduler = vi.fn(() => {
      run = runner
    })

    const obj = reactive({foo: 1})
    const runner = effect(()=>{
      dummy = obj.foo
    }, { scheduler })

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)

    obj.foo++

    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    run()
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(2)
  })

  it("stop", ()=>{
    let dummy

    const obj = reactive({foo: 1})
    const runner = effect(()=>{
      dummy = obj.foo
    })

    obj.foo = 2
    expect(dummy).toBe(2)

    stop(runner)
    obj.foo = 3
    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)
  })
})