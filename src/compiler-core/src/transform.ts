import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}){
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createTransformContext(root, options) {
  const context =  {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key){
      context.helpers.set(key, 1)
    }
  }

  return context
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function traverseNode(root, context) {
  context.nodeTransforms.forEach(plugin => plugin(root))

  switch (root.type){
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
      root.children.forEach(node => traverseNode(node, context))
      break
    case NodeTypes.ELEMENT:
      context.helper(CREATE_ELEMENT_VNODE)
      root.children.forEach(node => traverseNode(node, context))
      break
  }
}
