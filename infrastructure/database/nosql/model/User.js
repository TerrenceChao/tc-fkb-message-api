const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
var ChannelRecordSchema = require('./ChannelRecordSchema')

const UserSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true
  },
  receivedInvitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true
  }],
  sentInvitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true
  }],
  channelRecords: [ChannelRecordSchema],
  updatedAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  }
}, {
  writeConcern: mongoose.envParams.writeConcern
})

UserSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', UserSchema)