const mongoose = require('mongoose')

const foragerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  hp: {
    type: Number,
    required: true
  },
  mp: {
    type: Number,
    required: true
  },
  str: {
    type: Number,
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Forager', foragerSchema)
