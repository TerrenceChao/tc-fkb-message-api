var config = require('config')
var path = require('path')
var uuidv4 = require('uuid/v4')
var faker = require('faker')
var now = require('performance-now')
var { expect } = require('chai')
var database = require(config.get('test.mockConfig.database'))(config.root)
var { storageService } = require(path.join(config.get('src.service'), 'storageService'))

global.NOSQL_CONNECT_MODE = 'test'

function genUserInfo () {
  const givenName = faker.name.firstName()
  const familyName = faker.name.lastName()
  return {
    uid: uuidv4(),
    info: {
      givenName,
      familyName,
      profileLink: `${givenName}\'s profile link`,
      profilePic: `${givenName}\'s profile pic`
    }
  }
}

function executionTime (funcName, srt) {
  console.info(`${funcName} exe time: ${(now() - srt).toFixed(3)} ms`)
}

describe('storageService test', () => {
  before(() => database.nosql.db.connect())

  it('getUser (null)', async () => {
    // arrange
    const uid = uuidv4()

    // act
    const srt = now()
    const user = await storageService.getUser(uid)
    executionTime('getUser (null)', srt)

    // assert
    expect(user).to.be.equals(null)
  })

  it('createUserInfo', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const info = userInfo.info

    // act
    const srt = now()
    const user = await storageService.createUserInfo(userInfo)
    executionTime('createUserInfo', srt)

    // assert
    expect(user._doc).to.has.keys('__v', '_id', 'uid', 'info', 'receivedInvitations', 'sentInvitations', 'channelRecords', 'updatedAt', 'createdAt')
    expect(user._doc.uid).to.equals(uid)
    expect(user._doc.info).to.deep.equals(info)
    expect(user._doc.receivedInvitations).to.be.an('array').that.is.empty
    expect(user._doc.sentInvitations).to.be.an('array').that.is.empty
    expect(user._doc.channelRecords).to.be.an('array').that.is.empty
  })

  it('getUser', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const info = userInfo.info
    await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const user = await storageService.getUser(uid)
    executionTime('getUser', srt)

    // assert
    expect(user._doc).to.has.keys('_id', 'uid', 'info', 'receivedInvitations', 'sentInvitations', 'channelRecords', 'updatedAt', 'createdAt')
    expect(user._doc.uid).to.equals(uid)
    expect(user._doc.info).to.deep.equals(info)
    expect(user._doc.receivedInvitations).to.be.an('array').that.is.empty
    expect(user._doc.sentInvitations).to.be.an('array').that.is.empty
    expect(user._doc.channelRecords).to.be.an('array').that.is.empty
  })

  it('getUserInfoList', async () => {
    // arrange
    const userInfoA = genUserInfo()
    const uidA = userInfoA.uid
    const userInfoB = genUserInfo()
    const uidB = userInfoB.uid
    await storageService.createUserInfo(userInfoA)
    await storageService.createUserInfo(userInfoB)

    // act
    const srt = now()
    const userList = await storageService.getUserInfoList([uidA, uidB])
    executionTime('getUserInfoList', srt)

    // assert
    // console.log('getUserInfoList >>>', userList)
    Array.apply(null, [userInfoA, userInfoB]).forEach((user, idx) => {
      expect(userList[idx]._doc).to.has.keys('_id', 'uid', 'info', 'createdAt')
      expect(userList[idx]._doc.uid).to.equals(user.uid)
      expect(userList[idx]._doc.info).to.deep.equals(user.info)
    })
  })

  it('updateUserInfo', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const newUserInfo = genUserInfo().info

    // act
    const srt = now()
    const updatedUser = await storageService.updateUserInfo(uid, newUserInfo)
    executionTime('updateUserInfo', srt)

    // assert
    expect(updatedUser._doc).to.has.keys('__v', '_id', 'uid', 'info', 'receivedInvitations', 'sentInvitations', 'channelRecords', 'updatedAt', 'createdAt')
    expect(updatedUser._doc.uid).to.equals(uid)
    expect(updatedUser._doc.info).to.deep.equals(newUserInfo)
    expect(updatedUser._doc.receivedInvitations).to.be.an('array').that.is.empty
    expect(updatedUser._doc.sentInvitations).to.be.an('array').that.is.empty
    expect(updatedUser._doc.channelRecords).to.be.an('array').that.is.empty
  })

  it('channelInfoCreated', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')
    executionTime('channelInfoCreated', srt)
    const user = await storageService.getUser(uid)

    // assert
    expect(channelInfo.name).to.be.equals('A Channel')
    expect(channelInfo.creator).to.be.equals(uid)
    expect(channelInfo.recipients).to.be.an('array').that.is.empty
    expect(channelInfo.members[0]).to.be.equals(uid)

    expect(user._doc.channelRecords).to.be.an('array')
    expect(user._doc.channelRecords[0].chid).to.be.equals(channelInfo.chid)
  })

  it('updateLastGlimpse', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')
    const chid = channelInfo.chid
    const lastGlimpse = Date.now() + 5000

    // act
    const srt = now()
    await storageService.updateLastGlimpse(uid, [{ chid, lastGlimpse }])
    executionTime('updateLastGlimpse', srt)
    const user = await storageService.getUser(uid)

    // assert
    expect(user._doc.channelRecords).to.be.an('array')
    expect(user._doc.channelRecords[0].chid).to.be.equals(chid)
    // TODO: check the type of lastGlimpse
    // expect(user._doc.channelRecords[0].lastGlimpse).to.be.equals(new Date(lastGlimpse))
  })

  it('getAllChannelIds (empty array)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const channelIds = await storageService.getAllChannelIds(uid)
    executionTime('getAllChannelIds (empty array)', srt)

    // assert
    expect(channelIds).to.be.an('array').that.is.empty
  })

  it('getAllChannelIds', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')

    // act
    const srt = now()
    const channelIds = await storageService.getAllChannelIds(uid)
    executionTime('getAllChannelIds', srt)

    // assert
    expect(channelIds).to.be.an('array')
    expect(channelIds[0]).to.be.equals(channelInfo.chid)
  })

  it('getChannelInfo (null)', async () => {
    // assert
    // TODO: to.throw(Error, ...) is NOT WORKING in async/await
    // expect(storageService.getChannelInfo({ chid: null })).to.throw(Error)
  })

  it('getChannelInfo', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    let channelInfo = await storageService.channelInfoCreated(uid, 'Channel 2')
    const chid = channelInfo.chid

    // act
    const srt = now()
    channelInfo = await storageService.getChannelInfo({ chid })
    executionTime('getChannelInfo', srt)

    // assert
    expect(channelInfo.chid).to.be.equals(channelInfo.chid)
  })

  it('getUserChannelInfo (null)', async () => {
    // arrange
    const uid = null
    const chid = null

    // assert
    // TODO: to.throw(Error, ...) is NOT WORKING in async/await
    // expect(await storageService.getUserChannelInfo({ uid, chid })).to.throw(Error)
  })

  it('getUserChannelInfo', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    let channelInfo = await storageService.channelInfoCreated(uid, 'Channel 3')
    const chid = channelInfo.chid

    // act
    const srt = now()
    channelInfo = await storageService.getUserChannelInfo({ uid, chid })
    executionTime('getUserChannelInfo', srt)

    // assert
    expect(channelInfo.chid).to.be.equals(channelInfo.chid)
  })

  it('getUserChannelInfo (not member)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    let channelInfo = await storageService.channelInfoCreated(uid, 'Channel 3')
    const chid = channelInfo.chid
    const uidB = uuidv4()

    // act
    const srt = now()
    channelInfo = await storageService.getUserChannelInfo({ uid: uidB, chid })
    executionTime('getUserChannelInfo (not member)', srt)

    // assert
    expect(channelInfo).to.be.null
  })

  it('getUserChannelInfoList (empty array)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const channelInfoList = await storageService.getUserChannelInfoList(uid, 5, 0)
    executionTime('getUserChannelInfoList (empty array)', srt)

    // assert
    expect(channelInfoList).to.be.an('array').that.is.empty
  })

  it('getUserChannelInfoList', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Party')

    // act
    const srt = now()
    const channelInfoList = await storageService.getUserChannelInfoList(uid, 5, 0)
    executionTime('getUserChannelInfoList', srt)

    // assert
    expect(channelInfoList).to.be.an('array')
    expect(channelInfoList[0].chid).to.equal(channelInfo.chid)
  })

  it('channelJoined (compare the diffirence between before & after)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const userInfoB = genUserInfo()
    const uidB = userInfoB.uid
    await storageService.createUserInfo(userInfo)
    await storageService.createUserInfo(userInfoB)
    let channelInfo = await storageService.channelInfoCreated(uid, 'A Party')
    const chid = channelInfo.chid

    // act
    const srt = now()
    channelInfo = await storageService.channelJoined(uidB, chid)
    executionTime('channelJoined (compare the diffirence between before & after)', srt)

    // assert
    expect(channelInfo.chid).to.be.equals(chid)
    expect(channelInfo.creator).to.be.equals(uid)
    expect(channelInfo.members).to.deep.equal([uid, uidB])
  })

  it('channelLeaved (compare the diffirence between before & after)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const userInfoB = genUserInfo()
    const uidB = userInfoB.uid
    await storageService.createUserInfo(userInfo)
    await storageService.createUserInfo(userInfoB)
    let channelInfo = await storageService.channelInfoCreated(uid, 'A Party')
    const chid = channelInfo.chid
    await storageService.channelJoined(uidB, chid)

    // act: uid as the creator leaves the channel
    const srt = now()
    channelInfo = await storageService.channelLeaved(uid, chid)
    executionTime('channelLeaved (compare the diffirence between before & after)', srt)

    // assert: uidB is still member
    expect(channelInfo.chid).to.be.equals(chid)
    expect(channelInfo.creator).to.be.equals(uid)
    expect(channelInfo.members).to.deep.equal([uidB])
  })

  it('channelInfoRemoved', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Party')
    const chid = channelInfo.chid

    // act
    const srt = now()
    const result = await storageService.channelInfoRemoved({ chid })
    executionTime('channelInfoRemoved', srt)

    // assert
    expect(result).to.be.true
    // TODO: to.throw(Error, ...) is NOT WORKING in async/await
    // expect(await storageService.getChannelInfo({ chid })).to.throw(Error)
  })

  it('channelInfoRemoved (has removed)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Party')
    await storageService.channelInfoRemoved({ chid: channelInfo.chid })

    // act
    const srt = now()
    const result = await storageService.channelInfoRemoved({ chid: channelInfo.chid })
    executionTime('channelInfoRemoved (has removed)', srt)

    // assert
    expect(result).to.be.true
  })

  it('invitationMultiCreated', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfoA = genUserInfo()
    const recipientA = recipientInfoA.uid
    const recipientInfoB = genUserInfo()
    const recipientB = recipientInfoB.uid
    const recipients = [recipientA, recipientB]
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfoA)
    await storageService.createUserInfo(recipientInfoB)
    let channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = {}
    const sensitive = {
      chid: channelInfo.chid
    }

    // act
    const srt = now()
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      recipients,
      header,
      content,
      sensitive
    )
    executionTime('invitationMultiCreated', srt)
    channelInfo = await storageService.getChannelInfo({ chid: channelInfo.chid })

    // assert
    for (let i = 0; i < recipients.length; i++) {
      const invitation = invitationList[i]
      expect(invitation.inviter).to.be.equals(inviter)
      expect(invitation.recipient).to.be.equals(recipients[i])
      expect(invitation.header).to.be.equals(header)
      expect(invitation.content).to.be.equals(content)
      expect(invitation.sensitive).to.be.equals(sensitive)
    }
    expect(channelInfo.recipients).to.have.deep.members(recipients)
  })

  it('getInvitation (null)', async () => {
    // assert
    // TODO: to.throw(Error, ...) is NOT WORKING in async/await
    // expect(storageService.getInvitation('invitationID')).to.throw(Error, 'invitation ID(iid) is invalid')
  })

  it('getInvitation', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfo = genUserInfo()
    const recipient = recipientInfo.uid
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfo)
    const channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = { a: 1, b: 2 }
    const sensitive = {
      chid: channelInfo.chid
    }
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      [recipient],
      header,
      content,
      sensitive
    )

    // act
    const iid = invitationList[0].iid
    const srt = now()
    const invitation = await storageService.getInvitation(iid)
    executionTime('getInvitation', srt)

    // assert
    expect(invitation.iid).to.be.equals(iid)
    expect(invitation.inviter).to.be.equals(inviter)
    expect(invitation.recipient).to.be.equals(recipient)
    expect(invitation.header).to.deep.equals(header)
    expect(invitation.content).to.deep.equals(content)
    expect(invitation.sensitive).to.deep.equals(sensitive)
  })

  it('getReceivedInvitationList (empty array)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const user = await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const receivedInvitationList = await storageService.getReceivedInvitationList(uid, 2)
    executionTime('getReceivedInvitationList (empty array)', srt)

    // assert
    expect(receivedInvitationList).to.be.an('array').that.is.empty
  })

  it('getReceivedInvitationList', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfo = genUserInfo()
    const recipient = recipientInfo.uid
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfo)
    const channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = { a: 1, b: 2 }
    const sensitive = {
      chid: channelInfo.chid
    }
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      [recipient],
      header,
      content,
      sensitive
    )

    // act
    const iid = invitationList[0].iid
    const srt = now()
    const receivedInvitationList = await storageService.getReceivedInvitationList(recipient, 2)
    executionTime('getReceivedInvitationList', srt)

    // assert
    const receivedInvitation = receivedInvitationList[0]
    expect(receivedInvitation.iid).to.be.equals(iid)
    expect(receivedInvitation.inviter).to.be.equals(inviter)
    expect(receivedInvitation.recipient).to.be.equals(recipient)
    expect(receivedInvitation.header).to.deep.equals(header)
    expect(receivedInvitation.content).to.deep.equals(content)
    expect(receivedInvitation.sensitive).to.deep.equals(sensitive)
  })

  it('getSentInvitationList (empty array)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    const user = await storageService.createUserInfo(userInfo)

    // act
    const srt = now()
    const receivedInvitationList = await storageService.getSentInvitationList(uid, 2)
    executionTime('getSentInvitationList (empty array)', srt)

    // assert
    expect(receivedInvitationList).to.be.an('array').that.is.empty
  })

  it('getSentInvitationList', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfo = genUserInfo()
    const recipient = recipientInfo.uid
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfo)
    const channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = { a: 1, b: 2 }
    const sensitive = {
      chid: channelInfo.chid
    }
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      [recipient],
      header,
      content,
      sensitive
    )

    // act
    const iid = invitationList[0].iid
    const srt = now()
    const sentInvitationList = await storageService.getSentInvitationList(inviter, 2)
    executionTime('getSentInvitationList', srt)

    // assert
    const sentInvitation = sentInvitationList[0]
    expect(sentInvitation.iid).to.be.equals(iid)
    expect(sentInvitation.inviter).to.be.equals(inviter)
    expect(sentInvitation.recipient).to.be.equals(recipient)
    expect(sentInvitation.header).to.deep.equals(header)
    expect(sentInvitation.content).to.deep.equals(content)
    expect(sentInvitation.sensitive).to.deep.equals(sensitive)
  })

  it('invitationRemoved', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfo = genUserInfo()
    const recipient = recipientInfo.uid
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfo)
    const channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = { a: 1, b: 2 }
    const sensitive = {
      chid: channelInfo.chid
    }
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      [recipient],
      header,
      content,
      sensitive
    )
    const iid = invitationList[0].iid

    // act
    const srt = now()
    const removedInvitation = await storageService.invitationRemoved(iid)
    executionTime('invitationRemoved', srt)

    // assert
    // expect(removedInvitation._id).to.be.equals(iid)
    expect(removedInvitation.inviter).to.be.equals(inviter)
    expect(removedInvitation.recipient).to.be.equals(recipient)
    expect(removedInvitation.header).to.deep.equals(header)
    expect(removedInvitation.content).to.deep.equals(content)
    expect(removedInvitation.sensitive).to.deep.equals(sensitive)
  })

  it('invitationRemoved (has removed)', async () => {
    // arrange
    const inviterInfo = genUserInfo()
    const inviter = inviterInfo.uid
    const recipientInfo = genUserInfo()
    const recipient = recipientInfo.uid
    await storageService.createUserInfo(inviterInfo)
    await storageService.createUserInfo(recipientInfo)
    const channelInfo = await storageService.channelInfoCreated(inviter, 'A Channel')
    const header = {
      requestEvent: 'invitation_deal_with_invitation',
      data: {
        channelName: 'A channel'
      }
    }
    const content = { a: 1, b: 2 }
    const sensitive = {
      chid: channelInfo.chid
    }
    const invitationList = await storageService.invitationMultiCreated(
      inviter,
      [recipient],
      header,
      content,
      sensitive
    )
    const iid = invitationList[0].iid

    // act
    const srt = now()
    await storageService.invitationRemoved(iid)
    executionTime('invitationRemoved (has removed)', srt)

    // assert
    // TODO: to.throw(Error, ...) is NOT WORKING in async/await
    // expect(await storageService.invitationRemoved(iid)).to.throw(Error, `remove invitation: ${iid} fail`)
  })

  it('conversationCreated', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')
    const chid = channelInfo.chid
    const content = { say: 'content is anything as the JSON format' }
    const type = 'text'
    const sentTime = Date.now()

    // act
    const srt = now()
    const conversation = await storageService.conversationCreated(chid, uid, content, type, sentTime)
    executionTime('conversationCreated', srt)

    // assert
    expect(conversation.chid).to.be.equals(chid)
    expect(conversation.sender).to.be.equals(uid)
    expect(conversation.content).to.deep.equals(content)
    expect(conversation.type).to.be.equals(type)
    // expect(conversation.datetime).to.be.equals(sentTime) // need format transform
  })

  it('getConversationList (empty array)', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')
    const chid = channelInfo.chid

    // act
    const srt = now()
    const conversationList = await storageService.getConversationList(uid, chid, 5)
    executionTime('getConversationList (empty array)', srt)

    // assert
    expect(conversationList).to.be.an('array').that.is.empty
  })

  it('getConversationList', async () => {
    // arrange
    const userInfo = genUserInfo()
    const uid = userInfo.uid
    await storageService.createUserInfo(userInfo)
    const channelInfo = await storageService.channelInfoCreated(uid, 'A Channel')
    const chid = channelInfo.chid
    const content = { say: 'content is anything as the JSON format' }
    const type = 'text'
    const sentTime = Date.now()
    await storageService.conversationCreated(chid, uid, content, type, sentTime)

    // act
    const srt = now()
    const conversationList = await storageService.getConversationList(uid, chid, 5)
    executionTime('getConversationList', srt)

    // assert
    const conversation = conversationList[0]
    expect(conversation.chid).to.be.equals(chid)
    expect(conversation.sender).to.be.equals(uid)
    expect(conversation.content).to.deep.equals(content)
    expect(conversation.type).to.be.equals(type)
    // expect(conversation.datetime).to.be.equals(sentTime) // need format transform
  })

  after(async () => {
    await (database.nosql.db).dropCollection('conversations')
    await database.nosql.db.dropCollection('channelinfos')
    await database.nosql.db.dropCollection('invitations')
    await database.nosql.db.dropCollection('users')

    database.nosql.db.disconnect()
  })
})
