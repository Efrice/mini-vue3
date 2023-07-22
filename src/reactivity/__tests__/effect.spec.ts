import { effect } from "../effect"
import { reactive } from "../reactive"

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

    const runer = effect(()=>{
      age++
      return 'age'
    })
    
    expect(age).toBe(19)
    const res = runer()
    expect(age).toBe(20)
    expect(res).toBe('age')
  })
})