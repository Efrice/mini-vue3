import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"

describe("Parse", ()=>{
  it("interpolation", () => {
    const ast = baseParse("{{ message }}")

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: "message"
      }
    })
  })

  it("element", () => {
    const ast = baseParse("<div></div>")

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: []
    })
  })

  it("text", () => {
    const ast = baseParse("hello world")

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: "hello world"
    })
  })

  it("hello world", () => {
    const ast = baseParse("<div>hi, {{ message }}</div>")

    expect(ast.children[0]).toStrictEqual(
      {
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeTypes.TEXT,
            content: "hi,"
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: "message"
            }
          }
        ]
      }
    )
  })

  it("nested element", () => {
    const ast = baseParse("<div><p>hi</p>{{ message }}</div>")

    expect(ast.children[0]).toStrictEqual(
      {
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeTypes.ELEMENT,
            tag: 'p',
            children: [
              {
                type: NodeTypes.TEXT,
                content: 'hi'
              }
            ]
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: "message"
            }
          }
        ]
      }
    )
  })

  it.only("should throw error when lack end tag", () => {
    expect(() => {
      baseParse("<div><p>hi{{ message }}</div>")
    }).toThrow("lack close tag p")
  })
})