var config = require('config')
var path = require('path')
var sinon = require('sinon')

var {
  handler
} = require(path.join(config.get('src.invitationEventHandler'), 'GetInvitationListEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var {
  delayFunc
} = require(path.join(config.get('test.mock'), 'common'))

describe('GetInvitationListEventHandler test', () => {
  const DELAY_IN_MS = 1
  var sandbox
  var stub
  var spySendInvitationList
  var spyAlertException
  var requestInfo
  var userPayload
  var storageService
  var businessEvent
  var invitationList

  before(() => {
    sandbox = sinon.sandbox.create()
    handler.globalContext = globalContext
    storageService = globalContext.storageService
    businessEvent = globalContext.businessEvent
    invitationList = [{
        iid: 'mbnht594EokdMvfht54elwTsd98',
        inviter: 'ruby',
        recipient: 'me',
        header: {},
        content: 'HTML string',
        sensitive: {
          chid: 'chid: sdfghjklcbvghikliuyuii7g',
          ciid: 'ciid A'
        },
        create_at: Date.now()
      }, {
        iid: '9kjnbvcdrtyuiljhgtloytfghjk',
        inviter: 'summer',
        recipient: 'me',
        header: {},
        content: 'another HTML string',
        sensitive: {
          chid: 'chid: aert5hewinaslgsi584waesr',
          ciid: 'ciid B'
        },
        create_at: Date.now()
      }]
  })

  beforeEach(() => {
    requestInfo = new RequestInfo()
    userPayload = {
      uid: 'd17aca55-c422-4284-9e1e-7610fe7abbb7',
      inviType: 'received',
      inviLimit: 10
    }

    requestInfo.packet = userPayload
    stub = sandbox.stub(storageService, 'getReceivedInvitationList')
    spySendInvitationList = sandbox.spy(handler, 'sendInvitationList')
    spyAlertException = sandbox.spy(handler, 'alertException')
  })

  it('[handle, Pass] test success if get invitation', (done) => {
    // arrange
    stub.callsFake(async (uid, limit, skip = 0) => {
      await delayFunc(DELAY_IN_MS, done)
      return invitationList
    })

    // act
    handler.handle(requestInfo)

    // assert
    // sandbox.assert.calledOnce(spySendInvitationList)
    sandbox.assert.notCalled(spyAlertException)
  })

  afterEach(() => {
    stub.restore()
    spySendInvitationList.restore()
    spyAlertException.restore()
  })
})
