// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for games
const Project = require('../models/project')

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
router.get('/projects', requireToken, (req, res, next) => {
  Project.find()
    .then(projects => {
      // `games` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return projects.map(project => project.toObject())
    })
    // respond with status 200 and JSON of the games
    .then(projects => res.status(200).json({ projects: projects }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /games/5a7db6c74d55bc51bdf39793
router.get('/projects/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Project.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "game" JSON
    .then(project => res.status(200).json({ project: project.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /games
router.post('/projects', requireToken, (req, res, next) => {
  // set owner of new game to be current user
  req.body.project.owner = req.user.id

  Project.create(req.body.project)
    // respond to succesful `create` with status 201 and JSON of new "game"
    .then(project => {
      res.status(201).json({ project: project.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /games/5a7db6c74d55bc51bdf39793
router.patch('/projects/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.project.owner

  Project.findById(req.params.id)
    .then(handle404)
    .then(project => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      if (project.user2 === undefined) {
        return Project.findOneAndUpdate({_id: req.params.id}, req.body.project, {new: true})
      }

      if ((req.body.project.user1 !== project.user1) && (req.body.project.user2 !== project.user2)) {
        return 'You are not involved in this project'
      }
      // pass the result of Mongoose's `.update` to the next `.then`
      return Project.findOneAndUpdate({_id: req.params.id}, req.body.project, {new: true})
    })
    // if that succeeded, return 204 and no JSON
    .then(project => res.status(201).json({ project: project.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /games/5a7db6c74d55bc51bdf39793
router.delete('/projects/:id', requireToken, (req, res, next) => {
  Project.findById(req.params.id)
    .then(handle404)
    .then(project => {
      // throw an error if current user doesn't own `game`
      requireOwnership(req, project)
      // delete the game ONLY IF the above didn't throw
      project.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
