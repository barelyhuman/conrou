export const lazyIterator = data => {
  return (function* () {
    let val
    while ((val = data.shift())) {
      yield val
    }
    return
  })()
}
