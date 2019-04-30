const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const ConversationSchema = new mongoose.Schema({
  ciid: {
    type: String,
    ref: 'ChannelInfo',
    required: true
  },
  sender: {
    type: String,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  datetime: {
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

ConversationSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('Conversation', ConversationSchema)