export function transform(root, options){
  const context = createTransformContext(root, options)
  traverseNode(root, context)
}

function createTransformContext(root, options) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  };
}

function traverseNode(root, context) {
  context.nodeTransforms.forEach(plugin => plugin(root))
  root.children && root.children.forEach(node => traverseNode(node, context))
}
