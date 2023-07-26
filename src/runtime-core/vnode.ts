import { isArray, isString, ShapeFlags } from "../shared"

export function createVNode(type, props?, children?){
  const vnode = {
    el: null,
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type)
  }

  if(isString(children)){
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }else if(isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlag(type: any) {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}