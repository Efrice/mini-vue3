import { isReadonly, readonly } from "../reactive"

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
})