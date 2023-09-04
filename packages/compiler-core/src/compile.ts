import { generate } from "./codegen"
import { baseParse } from "./parse"
import { transform } from "./transform"
import { transformsElement } from "./transforms/transformElement"
import { transformExpression } from "./transforms/transformExpression"
import { transformText } from "./transforms/trnasformText"

export function baseCompile(template) {
  const ast = baseParse(template)
  transform(ast, {
    nodeTransforms: [transformExpression, transformText, transformsElement],
  })

  return generate(ast)
}