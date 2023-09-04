import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    },
  }

  return context
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function traverseNode(root, context) {
  const exitFns: any[] = []
  context.nodeTransforms.forEach((plugin) => {
    const exitFn = plugin(root, context)
    exitFn && exitFns.push(exitFn)
  })

  switch (root.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      root.children.forEach((node) => traverseNode(node, context))
      break
  }

  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
