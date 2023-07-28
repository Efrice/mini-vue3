import { isFunction } from "../../shared";
import { Fragment, createVNode } from "../vnode";

export function renderSlots(slots, name, props){
  const slot = slots[name]

  if(slot){
    if(isFunction(slot)){
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
