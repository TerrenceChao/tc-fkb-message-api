var config = require('config')
var path = require('path')
var sinon = require('sinon')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var {
  handler
} = require(path.join(config.get('src.connectionEventHandler'), 'DisconnectEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))

describe('DisonnectEventHandler test', () => {
  var sandbox
  var requestInfo
  var userPayload
  var spyEmit
  var businessEvent

  before(() => {
    sandbox = sinon.sandbox.create()
    handler.globalContext = globalContext
    businessEvent = globalContext.businessEvent

    spyEmit = sandbox.spy(businessEvent, 'emit')
  })

  it('[handle, Pass] test success while calling disconnect event', () => {
    // arrange
    userPayload = {
      uid: 'd17aca55-c422-4284-9e1e-7610fe7abbb7'
    }
    requestInfo = new RequestInfo()
    requestInfo.packet = userPayload

    // act
    handler.handle(requestInfo)

    // assert
    sandbox.assert.calledTwice(spyEmit)
    sinon.assert.calledWith(spyEmit, EVENTS.USER_OFFLINE, requestInfo)
    sinon.assert.calledWith(spyEmit, EVENTS.CHANNEL_OFFLINE, requestInfo)
  })

  after(() => {
    spyEmit.restore()
  })
})
