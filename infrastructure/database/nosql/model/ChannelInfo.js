const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const ChannelInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: String,
    ref: 'User',
    required: true
  }],
  members: [{
    type: String,
    ref: 'User',
    required: true
  }],
  // considering: Date OR int64
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

ChannelInfoSchema.virtual('chid').get(function () {
  return this._id
})

module.exports = mongoose.model('ChannelInfo', ChannelInfoSchema)
