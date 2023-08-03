import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformsElement(node, context){
  if(node.type === NodeTypes.ELEMENT){
    return () => {
      context.helper(CREATE_ELEMENT_VNODE)
    }    
  }
}
