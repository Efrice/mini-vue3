export * from "@mini-vue3/runtime-dom"
import * as runtimeDom from "@mini-vue3/runtime-dom"
import { registerRuntimeCompiler } from "@mini-vue3/runtime-dom"

import { baseCompile } from "@mini-vue3/compiler-core"

function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function("Vue", code)(runtimeDom)

  return render
}

registerRuntimeCompiler(compileToFunction)
