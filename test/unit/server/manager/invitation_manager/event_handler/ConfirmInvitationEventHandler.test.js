var config = require('config')
var path = require('path')
var assert = require('chai').assert
var sinon = require('sinon')

var {
  handler
} = require(path.join(config.get('src.invitationEventHandler'), 'ConfirmInvitationEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var {
  delayFunc
} = require(path.join(config.get('test.mock'), 'common'))

describe('ConfirmInvitationEventHandler test', () => {
  const DELAY_IN_MS = 2
  var stub
  var requestInfo
  var userPayload
  var storageService
  var businessEvent

  before(() => {
    handler.globalContext = globalContext
    storageService = globalContext.storageService
    businessEvent = globalContext.businessEvent
  })

  beforeEach(() => {
    requestInfo = new RequestInfo()
    userPayload = {
      uid: 'd17aca55-c422-4284-9e1e-7610fe7abbb7',
      iid: 'b4be066c-106c-4299-b191-42656c69fc1f'
    }

    requestInfo.packet = userPayload
  })

  it('[handle, Pass] test success if invitation removed', (done) => {
    // arrange
    stub = sinon.stub(storageService, 'invitationRemoved')
      .callsFake((iid) => delayFunc(DELAY_IN_MS).then(() => done()))

    // act & assert
    sinon.assert.pass(handler.handle(requestInfo))
  })

  it('[handle, Fail] test fail if invitation not removed', () => {
    // arrange
    stub = sinon.stub(storageService, 'invitationRemoved')
      .callsFake((iid) => {
        throw new Error(`invitation NOT REMOVED`)
      })

    // assert
    var emit = sinon.spy(businessEvent, 'emit')
    emit.restore()
    sinon.assert.calledOnce(emit)

    // act
    handler.handle(requestInfo)
  })

  afterEach(() => {
    stub.restore()
  })
})
