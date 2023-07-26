export * from './ShapeFlags'

export const extend = Object.assign

export const isOn = (key: string): boolean => /^on[A-Z]/.test(key)
export const getEvent = (key: string): string => key.slice(2).toLowerCase()
export const isArray = Array.isArray
export const isString = (val: any): boolean => typeof val === 'string'
export const isObject = (val: any): boolean => {
  return val !== null && typeof val === 'object'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (obj: Object | Array<any>, key: string): boolean => hasOwnProperty.call(obj, key)

export const equal = (value1: any, value2: any): boolean => Object.is(value1, value2)
