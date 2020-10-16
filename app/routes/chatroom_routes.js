// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for games
const Chatroom = require('../models/chatroom')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { game: { title: '', text: 'foo' } } -> { game: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /games
router.get('/chatrooms', requireToken, (req, res, next) => {
  Chatroom.find()
    .then(chatrooms => {
      // `games` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return chatrooms.map(chatroom => chatroom.toObject())
    })
    // respond with status 200 and JSON of the games
    .then(chatrooms => res.status(200).json({ chatrooms: chatrooms }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /games/5a7db6c74d55bc51bdf39793
router.get('/chatrooms/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Chatroom.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "game" JSON
    .then(chatroom => res.status(200).json({ chatroom: chatroom.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /games
router.post('/chatrooms', requireToken, (req, res, next) => {
  // set owner of new game to be current user
  req.body.game.owner = req.user.id

  Chatroom.create(req.body.chatroom)
    // respond to succesful `create` with status 201 and JSON of new "game"
    .then(chatroom => {
      res.status(201).json({ chatroom: chatroom.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /games/5a7db6c74d55bc51bdf39793
router.patch('/chatrooms/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.chatroom.owner

  Chatroom.findById(req.params.id)
    .then(handle404)
    .then(chatroom => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      if (chatroom.user2 === undefined) {
        return Chatroom.findOneAndUpdate({_id: req.params.id}, req.body.chatroom, {new: true})
      }

      if ((req.body.chatroom.user1 !== chatroom.user1) && (req.body.chatroom.user2 !== chatroom.user2)) {
        return 'You are not involved in this project'
      }
      // pass the result of Mongoose's `.update` to the next `.then`
      return Chatroom.findOneAndUpdate({_id: req.params.id}, req.body.chatroom, {new: true})
    })
    // if that succeeded, return 204 and no JSON
    .then(chatroom => res.status(201).json({ chatroom: chatroom.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /games/5a7db6c74d55bc51bdf39793
router.delete('/games/:id', requireToken, (req, res, next) => {
  Chatroom.findById(req.params.id)
    .then(handle404)
    .then(chatroom => {
      // throw an error if current user doesn't own `game`
      requireOwnership(req, chatroom)
      // delete the game ONLY IF the above didn't throw
      chatroom.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
