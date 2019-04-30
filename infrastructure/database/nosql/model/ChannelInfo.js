const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const ChannelInfoSchema = new mongoose.Schema({
  ciid: {
    type: String,
    required: true,
    unique: true
  },
  //considering: string OR ObjectId
  chid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    ref: 'User',
    required: true
  },
  invitees: [{
    type: String,
    ref: 'User',
    required: true
  }],
  members: [{
    type: String,
    ref: 'User',
    required: true
  }],
  //considering: Date OR int64
  latestSpoke: {
    type: Date,
    required: true
  },
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

ChannelInfoSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('ChannelInfo', ChannelInfoSchema)