import { onEvent } from "../shared"

export function emit(instance, event, ...args) {
  const { props } = instance
  
  const handler = props[onEvent(event)]

  handler && handler(...args)
}
