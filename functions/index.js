// Admin setup
const admin = require('firebase-admin')
try {
  admin.initializeApp()
} catch (e) {
  true
}
exports.test = require('./test')
