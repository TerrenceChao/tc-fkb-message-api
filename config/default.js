require('dotenv').config()
var fs = require('fs')
var path = require('path')
var project = JSON.parse(fs.readFileSync('package.json'))
const ROOT = getParentDirPath(__dirname, project.name)

/**
 * @private
 * @param {string} currentDir
 * @param {string} specifyDir
 * @returns {string}
 */
function getParentDirPath (currentDir, specifyDir) {
  if (specifyDir == null) {
    return path.resolve(currentDir, '../')
  }

  while (path.basename(currentDir) !== specifyDir) {
    currentDir = path.resolve(currentDir, '../')
  }
  return currentDir
}

module.exports = {
  root: ROOT,
  app: require('./_app'),
  auth: require('./_auth'),
  adaptor: require('./_adaptor'),
  database: require('./_database')(ROOT),
  src: require('./_src')(ROOT),
  test: require('./_test')(ROOT)
}
