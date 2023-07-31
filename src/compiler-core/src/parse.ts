import { NodeTypes } from "./ast"

const enum TagTypes {
  START,
  END
}

export function baseParse(content: string){
  const context = createParseContent(content)
  return createRoot(parseChildren(context, []))
}

function createParseContent(content: string) {
  return {
    source: content
  }
}

function parseChildren(context, ancestors){
  const nodes: any = []
  while(!isEnd(context, ancestors)){
    let node
    const s = context.source
    if(s.startsWith('{{')){
      node = parseInterpolation(context)
    }else if(s.startsWith('<')){
      if(/[a-z]/i.test(s[1])){
        node = parseElement(context, ancestors)
      }
    }else {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function isEnd(context, ancestors) {
  if(ancestors.length > 0 && context.source.startsWith('</')){
    for (let i = ancestors.length - 1; i >= 0; i++) {
      const tag = ancestors[i];
      if(startsWithEndTagOpen(context.source, tag)){
        return true
      }
    }
  }

  return !context.source
}

function parseText(context) {
  let endIndex = context.source.length
  let endTokens = ["<", "{{"]
  endTokens.forEach(item => {
    const index = context.source.indexOf(item)
    if(index !== -1 && endIndex > index){
      endIndex = index
    }
  })

  const content = parseTextData(context, endIndex)
  advanceBy(context, content.length)
 
  return {
    type: NodeTypes.TEXT,
    content: content.trim()
  }
}

function parseTextData(context: any, length: number) {
  return context.source.slice(0, length)
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagTypes.START)
  ancestors.push(element.tag)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  
  if(startsWithEndTagOpen(context.source, element.tag)){
    parseTag(context, TagTypes.END)
  }else {
    throw new Error(`lack close tag ${element.tag}`)
  }
 
  return element
}

function startsWithEndTagOpen(source, tag) {
  const closeTagFlag = "</", len = closeTagFlag.length
  return source.startsWith(closeTagFlag) && source.slice(len, len + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context: any, tagType) {
  const match: any = /^<\/?([a-z]+)/.exec(context.source)
  const tag = match[1]
  advanceBy(context, match[0].length + 1)
  if(tagType === TagTypes.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseInterpolation(context) {
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - closeDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: rawContent.trim()
    }
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children
  }
}