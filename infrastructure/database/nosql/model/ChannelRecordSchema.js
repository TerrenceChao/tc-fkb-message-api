const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const ChannelRecordSchema = new mongoose.Schema({
  ciid: {
    type: String,
    ref: 'ChannelInfo',
    required: true
  },
  chid: {
    type: String,
    ref: 'ChannelInfo',
    required: true
  },
  joinedAt: {
    type: Date,
    required: true
  },
  // considering: Date OR int64
  lastGlimpse: {
    type: Date,
    required: true
  }
}, {
  writeConcern: mongoose.envParams.writeConcern
})

ChannelRecordSchema.plugin(mongodbErrorHandler)

module.exports = ChannelRecordSchema