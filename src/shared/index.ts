export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const equal = (value1, value2) => Object.is(value1, value2)
