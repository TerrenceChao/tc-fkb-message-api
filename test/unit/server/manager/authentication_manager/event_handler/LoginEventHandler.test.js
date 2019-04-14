var config = require('config')
var path = require('path')
var assert = require('chai').assert

var {
  handler
} = require(path.join(config.get('src.authenticationEventHandler'), 'LoginEventHandler'))

const USER_ID = config.get('auth.properties')[0]
const EXTRA_INFO = config.get('auth.properties')[1]
const TOKEN = config.get('auth.token')

describe('LoginEventHandler test', () => {

  beforeEach(() => {

  })
})
