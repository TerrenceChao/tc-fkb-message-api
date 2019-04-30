const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const InvitationSchema = new mongoose.Schema({
  inviter: {
    type: String,
    ref: 'User',
    required: true
  },
  invitee: {
    type: String,
    ref: 'User',
    required: true
  },
  header: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  sensitive: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    required: true
  }
}, {
  writeConcern: mongoose.envParams.writeConcern
})

InvitationSchema.plugin(mongodbErrorHandler)

InvitationSchema.virtual('iid').get(function () {
  return this._id
})

module.exports = mongoose.model('Invitation', InvitationSchema)
