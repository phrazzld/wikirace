// models/run.js

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('@models/user')

const RunSchema = new Schema({
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  },
  path: {
    type: [String],
    required: true,
  },
  startTime: Date,
  finishTime: Date,
  user: User.schema
}, {
  timestamps: true
})

module.exports = {
  model: mongoose.model('Run', RunSchema),
  schema: RunSchema
}
