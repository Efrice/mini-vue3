import { ShapeFlags, isArray, isObject } from "../shared";

export function initSlots(instance, children){
  const { shapeFlag } = instance.vnode
  if (shapeFlag & ShapeFlags.SLOT_CHILDREN && isObject(children)) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotvalue(value(props));
  }
}

function normalizeSlotvalue(value: any): any {
  return isArray(value) ? value : [value];
}
