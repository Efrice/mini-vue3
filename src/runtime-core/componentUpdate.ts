export function shouldComponentUpdate(n1, n2): boolean{
  const { props: prevProps } = n1
  const { props: nextProps } = n2
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}