function delayFunc (delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`func delay ${delay} ms`)
    }, delay)
  })
    .then(msg => console.log(msg))
}

module.exports = {
  delayFunc
}
