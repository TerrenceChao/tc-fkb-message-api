var config = require('config')
var path = require('path')
var sinon = require('sinon')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var {
  handler
} = require(path.join(config.get('src.userEventHandler'), 'UserOnlineEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var {
  stubSocketServer
} = require(path.join(config.get('test.mock'), 'common'))

describe('UserOnlineEventHandler test', () => {
  var sandbox
  var requestInfo
  var respnseInfo
  var userPayload
  var businessEvent
  var socketServer
  var spyRemoteJoin
  var spyEmit

  before(() => {
    sandbox = sinon.sandbox.create()
    handler.globalContext = globalContext
    businessEvent = globalContext.businessEvent
    socketServer = globalContext.socketServer = stubSocketServer

    spyRemoteJoin = sandbox.spy(socketServer, 'remoteJoin')
    spyEmit = sandbox.spy(businessEvent, 'emit')
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
      .setPacket({
        msgCode: `user is online`,
        data: {
          uid: userPayload.uid
        }
      })

    // act
    handler.handle(requestInfo)

    // assert
    sandbox.assert.calledOnce(spyRemoteJoin)
    sinon.assert.calledWith(
      spyRemoteJoin,
      requestInfo.socket.id,
      requestInfo.packet.uid
    )

    sandbox.assert.calledOnce(spyEmit)
    sinon.assert.calledWith(spyEmit, EVENTS.SEND_MESSAGE, respnseInfo)
  })

  after(() => {
    spyRemoteJoin.restore()
    spyEmit.restore()
  })
})
