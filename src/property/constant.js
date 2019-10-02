module.exports = {
  HTTP: {
    AUTHENTICATE_RULES: {
      uid: 'required|string',
      clientuseragent: 'required|string'
    },
    PUSH_NOTIFICATION_RULES: {
      receivers: 'required|array',
      event: 'required|string',
      content: 'required'
    }
  }
}