var config = require('config')
var path = require('path')
var sinon = require('sinon')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var {
  handler
} = require(path.join(config.get('src.userEventHandler'), 'UserOfflineEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var {
  stubSocketService
} = require(path.join(config.get('test.mock'), 'common'))

const USER_OFFLINE_INFO = RES_META.USER_OFFLINE_INFO

describe('UserOfflineEventHandler test', () => {
  var sandbox
  var requestInfo
  var respnseInfo
  var userPayload
  var businessEvent
  var socketService
  var spyEmit
  var spyRemoteLeave

  before(() => {
    sandbox = sinon.sandbox.create()
    handler.globalContext = globalContext
    businessEvent = globalContext.businessEvent
    socketService = globalContext.socketService = stubSocketService

    spyEmit = sandbox.spy(businessEvent, 'emit')
    spyRemoteLeave = sandbox.spy(socketService, 'remoteLeave')
  })

  it('[handle, Pass] test success while calling connect event', () => {
    // arrange
    userPayload = {
      uid: 'd17aca55-c422-4284-9e1e-7610fe7abbb7'
    }
    requestInfo = new RequestInfo()
    requestInfo.packet = userPayload
    requestInfo.socket = {
      id: 'socket id'
    }
    respnseInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.USER,
        receiver: userPayload.uid,
        responseEvent: RESPONSE_EVENTS.PERSONAL_INFO
      })
      .responsePacket({ uid: userPayload.uid }, USER_OFFLINE_INFO)

    // act
    handler.handle(requestInfo)

    // assert
    sandbox.assert.calledOnce(spyEmit)
    sinon.assert.calledWith(spyEmit, EVENTS.SEND_MESSAGE, respnseInfo)

    sandbox.assert.calledOnce(spyRemoteLeave)
    sinon.assert.calledWith(
      spyRemoteLeave,
      requestInfo.socket.id,
      requestInfo.packet.uid
    )
  })

  after(() => {
    spyEmit.restore()
    spyRemoteLeave.restore()
  })
})
