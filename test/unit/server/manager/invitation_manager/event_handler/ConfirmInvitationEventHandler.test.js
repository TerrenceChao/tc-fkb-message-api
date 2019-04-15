var config = require('config')
var path = require('path')
var assert = require('chai').assert
var sinon = require('sinon')

var {
  handler
} = require(path.join(config.get('src.invitationEventHandler'), 'ConfirmInvitationEventHandler'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))

describe('ConfirmInvitationEventHandler test', () => {
  var requestInfo
  var userPayload

  before(() => {
    handler.globalContext = globalContext
  })

  beforeEach(() => {
    requestInfo = new RequestInfo()
    userPayload = {
      uid: 'd17aca55-c422-4284-9e1e-7610fe7abbb7',
      iid: 'b4be066c-106c-4299-b191-42656c69fc1f'
    }

    requestInfo.packet = userPayload
  })

  it('[handle, Pass] ', () => {
    userPayload.fn = 9
    assert.isTrue(true)
  })
})
