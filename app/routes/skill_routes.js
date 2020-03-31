// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for skill
const Skill = require('../models/skill')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { skill: { title: '', text: 'foo' } } -> { skill: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /skills
router.get('/skills', (req, res, next) => {
  Skill.find()
    .sort({updatedAt: -1})
    // respond with status 200 and JSON of the skills
    .then(skills => {
      res.status(200).json({ skills: skills })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /skills/5a7db6c74d55bc51bdf39793
router.get('/skills/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Skill.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "skill" JSON
    .then(skill => {
      res.status(200).json({ skill: skill.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /skills
router.post('/skills', requireToken, (req, res, next) => {
  // set owner of new skill to be current user
  req.body.skill.owner = req.user.id
  // Check to see if the item exists
  Skill.create(req.body.skill)
    .then(skill => res.status(201).json({ skill: skill.toObject() }))
    .catch(next)
})

// UPDATE
// PATCH /skills/5a7db6c74d55bc51bdf39793
router.patch('/skills/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.skill.owner

  Skill.findById(req.params.id)
    .then(handle404)
    .then(skill => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      console.log(req.params.id)

      requireOwnership(req, skill)

      // pass the result of Mongoose's `.update` to the next `.then`
      return Skill.findOneAndUpdate({_id: req.params.id}, req.body.skill, {new: true})
    })
    // if that succeeded, return 204 and no JSON
    .then(skill => res.status(201).json({ skill: skill.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /skills/5a7db6c74d55bc51bdf39793
router.delete('/skills/:id', requireToken, (req, res, next) => {
  Skill.findById(req.params.id)
    .then(handle404)
    .then(skill => {
      // throw an error if current user doesn't own `skill`
      requireOwnership(req, skill)
      // delete the skill ONLY IF the above didn't throw
      skill.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
