import { readonly, isReadonly, isProxy } from "../reactive"

describe("readonly",()=>{
  it("happy pass",()=>{
    const original = {
      foo: 1
    }
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)

    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(original)).toBe(false)

    expect(isProxy(observed)).toBe(true)
  })

  it("should warn when set",()=>{
    console.warn = vi.fn()

    const original = {
      foo: 1
    }
    const observed = readonly(original)
    observed.foo++

    expect(console.warn).toBeCalled()
  })

  it("nested readonly",()=>{
    const original = {
      nested: {
        foo: 1
      },
      arr: [{bar: 2}]
    }
    const observed = readonly(original)

    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.arr)).toBe(true)
    expect(isReadonly(observed.arr[0])).toBe(true)
  })
})