import { isReadonly, shallowReadonly } from "../src/reactive"

describe("shallowReadonly", () => {
  it("happy pass", () => {
    const original = {
      nested: {
        foo: 1,
      },
      arr: [{ bar: 2 }],
    }
    const observed = shallowReadonly(original)

    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(observed.nested)).toBe(false)
    expect(isReadonly(observed.arr)).toBe(false)
    expect(isReadonly(observed.arr[0])).toBe(false)
  })

  it("should warn when set", () => {
    console.warn = vi.fn()

    const original = {
      foo: 1,
    }
    const observed = shallowReadonly(original)
    observed.foo++

    expect(console.warn).toBeCalled()
  })
})
