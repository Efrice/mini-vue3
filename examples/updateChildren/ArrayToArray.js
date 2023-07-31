import { h } from '../../lib/mini-vue3.esm.js'

// 简单场景 单支变换
// 1、老的比新的长 右侧 删除
// （a b）c
//  (a b)

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B")
// ]

// 2、老的比新的长 左侧 删除
//  a (b c)
//    (b c)

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// export const nextChildren = [
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// 3、新的比老的长 右侧 新增
// （a b）
//  (a b) c

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// 4、新的比老的长 左侧 新增
//    (b c)
//  a (b c)

// export const prevChildren = [
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// 复杂场景 新老都需变换
// 1、左侧一致
// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "F"}, "F")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "F"}, "F")
// ]

// 2、右侧一致
// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// export const nextChildren = [
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "E"}, "E"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C")
// ]

// 3、两端一致 中间对比
// 移动
// a b (c d e) f g
// a b (e c d) f g

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "E"}, "E"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "E"}, "E"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// 新增
// a b (c d e) f g
// a b (e c d) f g

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "E"}, "E"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// export const nextChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "H"}, "H"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// 综合
// a b (c d e z) f g
// a b (d c y e) f g

// export const prevChildren = [
//   h('p', {key: "A"}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "Z"}, "Z"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// export const nextChildren = [
//   h('p', {key: "A", id: 'a'}, "A"),
//   h('p', {key: "B"}, "B"),
//   h('p', {key: "D"}, "D"),
//   h('p', {key: "C"}, "C"),
//   h('p', {key: "Y"}, "Y"),
//   h('p', {key: "E"}, "E"),
//   h('p', {key: "F"}, "F"),
//   h('p', {key: "G"}, "G")
// ]

// fix

export const prevChildren = [
  h('p', {key: "A"}, "A"),
  h('p', {}, "C"),
  h('p', {key: "B"}, "B"),
  h('p', {key: "D"}, "D")
]

export const nextChildren = [
  h('p', {key: "A"}, "A"),
  h('p', {key: "B"}, "B"),
  h('p', {}, "C"),
  h('p', {key: "D"}, "D")
]
