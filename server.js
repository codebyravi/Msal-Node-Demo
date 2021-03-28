const express = require('express')
const session = require('express-session')
const config = require('./config')
const utils = require('./utils')
const MemoryStore = require('memorystore')(session)

// Initialize Express App
const app = express()

// Initialize session middlware
app.use(session({
    name: 'session_id',
    secret: config.session_key, // this is used to encrypt session id
    resave: false, // applicable for session stores that don't support 'touch' command
    saveUninitialized: false, // prevent empty sessions
    store: new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000 // prune expired entries every 24h
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24h
        sameSite: 'lax', // allow cookie access within this domain, but disallow cross-site
        httpOnly: true, // prevent javascript from reading cookie
        secure: false // true means https only
    },
}))

// Implement authentication routing
app.use('/auth', require('./auth').route())
app.get('/logout', (req, res) => {
    res.redirect('./auth/logout')
})

// Authenticate user
app.use((req, res, next) => {
    // Send user to auth if they're not signed in
    if (!req.session.user) {
        req.session.originalUrl = req.originalUrl
        res.redirect('./auth')
    }
    // Send "Unauthroized" if user is not in the Access Group
    else if (!utils.checkAccess(req.session.groups, config.auth_groups)){
        res.sendStatus(401)
    }
    // User passed the checks
    else {
        next()
    }
})

// Protected Routes

app.get('/', (req, res) => {
    res.send(req.session.user)
})

app.get('/groups', (req, res) => {
    res.send(req.session.groups)
})

// Start Express App
app.listen(config.port, () => console.log(`App listening on port ${config.port}!`))