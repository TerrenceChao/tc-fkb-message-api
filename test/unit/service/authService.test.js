var config = require('config')
var path = require('path')
var assert = require('chai').assert

var {
  authService
} = require(path.join(config.get('src.service'), 'authService'))

const USER_ID = config.get('auth.properties')[0]
const EXTRA_INFO = config.get('auth.properties')[1]
const TOKEN = config.get('auth.token')

describe('authService test', () => {

  var userPayload = {}
  before(() => {
    userPayload[USER_ID] = 'an user\'s UUID'
    userPayload[EXTRA_INFO] = 'FireFox'
  })

  it('[isAuthenticated, Pass]: check the token is valid if user payload is correct', () => {
    // arrange
    var token = authService.obtainAuthorization(userPayload)
    userPayload[TOKEN] = token

    // act
    var actual = authService.isAuthenticated(userPayload)

    // assert
    assert.isTrue(actual)
  })

  it('[isAuthenticated, Fail]: check the token is ERROR if user payload is INCORRECT', () => {
    // arrange
    var token = authService.obtainAuthorization(userPayload)
    var invalidUser = {}
    invalidUser[USER_ID] = 'another user (user B)'
    invalidUser[EXTRA_INFO] = 'Chrome'
    invalidUser[TOKEN] = token

    // act
    var actual = authService.isAuthenticated(invalidUser)

    // assert
    assert.isFalse(actual)
  })

  it('[obtainAuthorization, Fail]: get no token if payload IS NOT AN OBJECT', () => {
    // arrange
    var payload = 'is a string'

    // act
    var actualToken = authService.obtainAuthorization(payload)

    // assert
    assert.isFalse(actualToken)
  })

  it('[isAuthenticated, Fail]: is invalid if payload IS NOT AN OBJECT', () => {
    // arrange
    var payload = 'is a string'

    // act
    var actualAuthenticatedResult = authService.isAuthenticated(payload)

    // assert
    assert.isFalse(actualAuthenticatedResult)
  })

  it('[authorized, Pending]', () => {
    // TODO: do test if there's session service
  })
})
