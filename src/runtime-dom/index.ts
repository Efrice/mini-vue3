export function insert(el, parent, anchor = null){
  parent.insertBefore(el, anchor)
}

export function remove(child) {
  const parent = child.parentNode
  if(parent){
    parent.removeChild(child)
  }
}
