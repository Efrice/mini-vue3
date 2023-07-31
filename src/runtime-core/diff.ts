export function getSequence(nums){
  const len = nums.length
  const p = Array.from({length: len})
  const res = [0]
  let l, r
  for (let i = 1; i < len; i++) {
    const cur = nums[i], j = res[res.length - 1]
    if(nums[j] < cur) {
      p[i] = j
      res.push(i)
      continue
    }
    l = 0, r = res.length - 1
    while(l < r) {
      const mid = l + r >> 1
      if(nums[res[mid]] < cur) {
        l = mid + 1
      }else {
        r = mid
      }
    }
    if(nums[res[l]] > cur) {
      if(l > 0){
        p[i] = res[l - 1]
      }
      res[l] = i
    }
  }

  r = res.length - 1
  l = p[res[r]]

  while(r--){
    res[r] = l
    l = p[l]
  }

  return res
}
