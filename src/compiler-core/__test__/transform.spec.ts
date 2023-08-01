import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('tranform', () => {
  it('happy pass', () => {
    const ast = baseParse('<div>hi, {{ message }}</div>')
    const plugin = node => {
      if(node.type === NodeTypes.TEXT){
        node.content = 'hello world'
      }
    }
    transform(ast, {
      nodeTransforms: [ plugin ]
    })

    const textChild = ast.children[0].children[0]
    expect(textChild.content).toBe('hello world')
  })
})
