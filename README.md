# Fantasy Foragers

## Description
Fantasy Foragers is a text based, turn based, real time, multiplayer online role playing game where you can create your own character and have them face off with other characters created by your peers.

## User Stories:
-   As a user, I want to be able to create a new character
-   As a user, I want to be able to fight other characters
-   As a user, I want to be able to modify my characters i created
-   As a user, I want to be able to see the stats of my characters
-   As a user, I want to be able to find assign skills to my characters
-   As a user, I want to be able play with other people
-   As a user, I want to be able to see the history and logs of the fight

## Technologies used
-   socket.io
-   expressjs
-   node.js
-   mongodb
-   mongoose

## Wireframe
![link] (https://imgur.com/a/O4DZs88)
## ERD
![link] (https://imgur.com/a/O4DZs88)

## Links
-   [Fantasy Foragers deployed api] (https://sleepy-harbor-73832.herokuapp.com/)
-   [Fantasy Foragers deployed site] (https://kurotsubasa.github.io/fantasy-foragers-client/#/)
-   [Fantasy Foragers api repo] (https://github.com/kurotsubasa/fantasy-foragers-api)
-   [Fantasy Foragers client repo] (https://github.com/kurotsubasa/fantasy-foragers-client)


## Setup
-   `npm install --socket.io`
-   `npm install`
-   [API template](https://git.generalassemb.ly/ga-wdi-boston/express-api-template)

## Routes

### User Routes
-   Sign-up
-   Sign-in
-   Change-password
-   Sign-out

### Forager Routes
-   Create forager
-   Update Forager
-   Index Foragers
-   Show Foragers
-   Delete Foragers

### Skill Routes
-   Create Skills
-   Update Routes
-   Index Routes
-   Show Routes
-   Delete Routes

## Processs
**Day 1**
-   On the first day, I created the models for the foragers and the skills routes, I had also created the routes for the foragers but not the skills as I was focused on getting the foragers crud to work first.  At this point, the foragers model also did not include the skills reference.
**Day 2**
-   On the second day, I edited the forager models to include custom errors for when the player does not allocate all of their stats.
**Day 3**
-   On the third day, I created the routes for skills as well as added the reference to the skills model in the foragers model.
**Day 4**
-   On the fourth day, I added in the socket.io technologies in order to enable multiplayer on the app.
