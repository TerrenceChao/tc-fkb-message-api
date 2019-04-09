var fs = require('fs')
var path = require('path')
var package = JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
const ROOT = getParentDirPath(__dirname, package.name)

/**
 * @private
 * @param {string} currentDir
 * @param {string} specifyDir
 * @returns {string}
 */
function getParentDirPath(currentDir, specifyDir) {
  if (specifyDir == null) {
    return path.resolve(currentDir, '../')
  }

  while (path.basename(currentDir) != specifyDir) {
    currentDir = path.resolve(currentDir, '../')
  }
  return currentDir
}

require('dotenv').config({
  path: path.join(ROOT, '.env')
})

module.exports = {

  app: require('./_app'),
  auth: require('./_auth'),
  adaptor: require('./_adaptor'),
  src: require('./_src')(ROOT),
  test: require('./_test')(ROOT),
}
