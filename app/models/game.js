const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  forager1: {
    name: {
      type: String
    },
    hp: {
      type: Number
    },
    str: {
      type: Number
    },
    mp: {
      type: Number
    }
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  forager2: {
    name: {
      type: String
    },
    hp: {
      type: Number
    },
    str: {
      type: Number
    },
    mp: {
      type: Number
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Game', gameSchema)
