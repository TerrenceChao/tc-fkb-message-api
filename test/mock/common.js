function delayFunc (delay, done, err = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`func delay ${delay} ms`)
    }, delay)
  })
    .then(msg => {
      console.log(msg)
      done()

      if (err === null) {
        return Promise.resolve(true)
      }

      return Promise.reject(err)
    })
}

module.exports = {
  delayFunc
}
