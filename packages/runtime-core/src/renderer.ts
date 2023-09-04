import { effect } from "@mini-vue3/reactivity"
import { ShapeFlags } from "@mini-vue3/shared"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"
import { getSequence } from "./diff"
import { shouldComponentUpdate } from "./componentUpdate"
import { queueJobs } from "./scheduler"
import { createAppAPI } from "./createApp"

export function createRenderer(options) {
  const { createElement, patchProp, insert, remove } = options

  function render(vnode, container) {
    patch(null, vnode, container)
  }

  function patch(n1, n2: any, container: any, parentComponent?, anchor?) {
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2, container, parentComponent, anchor)
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))

    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, parentComponent, anchor) {
    const prevProps = n1.props
    const nextProps = n2.props

    const el = (n2.el = n1.el)

    patchProps(el, prevProps, nextProps)
    patchChildren(el, n1, n2, parentComponent, anchor)
  }

  function patchProps(el, prevProps, nextProps) {
    for (const key in nextProps) {
      const prevProp = prevProps[key]
      const nextProp = nextProps[key]

      if (prevProp !== nextProp) {
        patchProp(el, key, nextProp)
      }
    }

    for (const key in prevProps) {
      if (!(key in nextProps)) {
        patchProp(el, key, null)
      }
    }
  }

  function patchChildren(container, n1, n2, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag

    if (
      prevShapeFlag & ShapeFlags.TEXT_CHILDREN &&
      nextShapeFlag & ShapeFlags.TEXT_CHILDREN
    ) {
      setElementText(container, n2.children)
    } else if (
      prevShapeFlag & ShapeFlags.ARRAY_CHILDREN &&
      nextShapeFlag & ShapeFlags.TEXT_CHILDREN
    ) {
      unmountChildren(n1.children)
      setElementText(container, n2.children)
    } else if (
      prevShapeFlag & ShapeFlags.TEXT_CHILDREN &&
      nextShapeFlag & ShapeFlags.ARRAY_CHILDREN
    ) {
      setElementText(container, null)
      mountChildren(n2, container, parentComponent, anchor)
    } else if (
      prevShapeFlag & ShapeFlags.ARRAY_CHILDREN &&
      nextShapeFlag & ShapeFlags.ARRAY_CHILDREN
    ) {
      patchKeyedChildren(
        n1.children,
        n2.children,
        container,
        parentComponent,
        anchor
      )
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0,
      e1 = c1.length - 1,
      e2 = c2.length - 1
    const l2 = c2.length

    // left
    while (i <= e1 && i <= e2) {
      const n1 = c1[i],
        n2 = c2[i]

      if (isSameVNode(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor)
      } else {
        break
      }

      i++
    }

    // right
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1],
        n2 = c2[e2]

      if (isSameVNode(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor)
      } else {
        break
      }

      e1--
      e2--
    }

    // i e1 e2
    if (i > e1) {
      if (i <= e2) {
        const anchor = e2 + 1 < l2 ? c2[e2 + 1].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        remove(c1[i].el)
        i++
      }
    } else {
      // center
      let s1 = i,
        s2 = i

      const toBePatched = e2 - s2 + 1
      let patched = 0

      const newIndexToOldIndexMap = Array.from({ length: toBePatched }, () => 0)
      let moved = false
      let newIndexMax = 0
      const keyToNewIndexMap = new Map()
      for (let j = s2; j <= e2; j++) {
        const nextChild = c2[j]
        keyToNewIndexMap.set(nextChild.key, j)
      }

      let newIndex
      for (let k = s1; k <= e1; k++) {
        const prevChild = c1[k]

        if (patched >= toBePatched) {
          remove(prevChild.el)
          continue
        }

        if (prevChild.key) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let i = s2; i <= e2; i++) {
            if (isSameVNode(c1[i], c2[i])) {
              newIndex = i
              break
            }
          }
        }

        if (newIndex) {
          if (newIndex >= newIndexMax) {
            newIndexMax = newIndex
          } else {
            moved = true
          }
          patch(prevChild, c2[newIndex], container, parentComponent, anchor)
          newIndexToOldIndexMap[newIndex - s2] = k + 1
          patched++
        } else {
          remove(prevChild.el)
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        anchor = c2[i + s2 + 1].el
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, c2[i + s2], container, parentComponent, anchor)
        }
        if (moved) {
          if (increasingNewIndexSequence[j] !== i) {
            insert(c2[i + s2].el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function isSameVNode(n1, n2): boolean {
    return n1.type === n2.type && n1.key === n2.key
  }

  function setElementText(container, text) {
    container.textContent = text
  }

  function unmountChildren(children) {
    children.forEach((item) => {
      const { el } = item
      remove(el)
    })
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor?) {
    const { type, props, shapeFlag, children } = vnode
    const el = (vnode.el = createElement(type))

    setProps(el, props)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent, anchor)
    }

    insert(el, container, anchor)
  }

  function setProps(el, props) {
    for (const key in props) {
      const value = props[key]

      patchProp(el, key, value)
    }
  }

  function mountChildren(vnode, container, parentComponent, anchor) {
    vnode.children.forEach((v) =>
      patch(null, v, container, parentComponent, anchor)
    )
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      patchComponent(n1, n2)
    }
  }

  function patchComponent(n1, n2) {
    const instance = (n2.component = n1.component)

    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function mountComponent(n2: any, container: any, parentComponent, anchor) {
    const instance = (n2.component = createComponentInstance(
      n2,
      parentComponent
    ))

    setupComponent(instance)
    setupRenderEffect(instance, n2, container, anchor)
  }

  function setupRenderEffect(instance, vnode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance
          const subTree = instance.render.call(proxy, proxy)
          instance.subTree = subTree

          patch(null, subTree, container, instance)

          vnode.el = subTree.el

          instance.isMounted = true
        } else {
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }

          const { proxy } = instance
          const subTree = instance.render.call(proxy, proxy)
          const prevSubTree = instance.subTree
          instance.subTree = subTree

          patch(prevSubTree, subTree, container, instance, anchor)

          vnode.el = subTree.el
        }
      },
      {
        scheduler: () => {
          queueJobs(instance.update)
        },
      }
    )
  }

  function updateComponentPreRender(instance, next) {
    instance.vnode = next
    instance.next = null

    instance.props = next.props
  }

  return {
    render,
    createApp: createAppAPI(render),
  }
}
