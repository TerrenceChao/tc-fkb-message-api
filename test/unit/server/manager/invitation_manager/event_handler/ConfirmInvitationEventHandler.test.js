var config = require('config')
var path = require('path')
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
  const DELAY_IN_MS = 1
  var stub
  var requestInfo
  var userPayload
  var storageService

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
    stub = sinon.stub(storageService, 'invitationRemoved')
  })

  it('[handle, Pass] test success if invitation removed', (done) => {
    // arrange
    stub.callsFake(async (iid) => {
      await delayFunc(DELAY_IN_MS, done)
      return true
    })
    var alertException = sinon.spy(handler, 'alertException')

    // act
    handler.handle(requestInfo)

    // assert
    sinon.assert.notCalled(alertException)
    alertException.restore()
  })

  it('[handle, Fail] test fail if invitation not removed', (done) => {
    // arrange
    stub.callsFake((iid) => {
      return delayFunc(DELAY_IN_MS, done, new Error(`invitation NOT REMOVED`))
    })
    var alertException = sinon.spy(handler, 'alertException')

    // act
    handler.handle(requestInfo)

    // assert
    // sinon.assert.calledOnce(alertException)
    alertException.restore()
  })

  afterEach(() => {
    stub.restore()
  })
})
