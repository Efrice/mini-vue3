import { isString } from "@mini-vue3/shared"
import { NodeTypes } from "./ast"
import {
  CREATE_ELEMENT_VNODE,
  TO_DISPLAY_STRING,
  helperMapName,
} from "./runtimeHelpers"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genFuntionPreamble(ast, context)
  push("return ")

  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(", ")

  push(`function ${functionName}(${signature})`)
  push("{ return ")
  genNode(ast.codegenNode, context)

  push("}")

  return {
    code: context.code,
  }
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    },
  }
  return context
}

function genFuntionPreamble(ast, context) {
  const { push } = context
  const VueBinging = "Vue"
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}\n`
    )
  }
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
  }
}

function genCompoundExpression(node, context) {
  const { push } = context
  node.children.forEach((child) => {
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  })
}

function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(")")
}

function genExpression(node, context) {
  const { push } = context
  push(node.content)
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, children } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}('${tag}', null, `)
  children.forEach((child) => {
    genNode(child, context)
  })
  push(")")
}
