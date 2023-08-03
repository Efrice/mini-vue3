import { NodeTypes } from "../ast";

export function transformText(node){
  if(node.type === NodeTypes.ELEMENT){

    return () => {
      const { children } = node

      let nodeContainer
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if(isText(child)){
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if(isText(next)){
              if(!nodeContainer){
                nodeContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }

              nodeContainer.children.push(" + ")
              nodeContainer.children.push(next)
              children.splice(j, 1)
              j--
            }else {
              nodeContainer = null
              break
            }
          }
        }
      }
    }
  }
}

function isText(node){
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}