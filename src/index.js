// index.js

require('module-alias/register')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const MongoStore = require('connect-mongo')(session)
const app = express()
const mongoose = require('mongoose')
const config = require('@root/config')
const routes = require('@routes/index')
const auth = require('@root/auth')
const log = config.loggers.dev()

// Pull database config and connect to the database
mongoose.connect(config.mongoUrl, { server: { reconnectTries: Number.MAX_VALUE } })
mongoose.connection
  .once('open', () => {
    log.info('Mongoose successfully connected to Mongo')
  })
  .on('error', (err) => {
    log.info('Mongoose failed to connect to Mongo')
    log.fatal(err)
  })

// Load models
const User = require('@models/user').model
const Run = require('@models/run').model

// Handle x-www-form-urlencoded requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Handle cookies and sessions
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'krabby patty secret formula',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 24
  }
}))

// Passport authentication
app.use(auth.initialize)
app.use(auth.session)
app.use(auth.setUser)

// Set EJS as our templating engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Hook up routes
app.use('/', routes)

// Start listening for port activity
app.listen(config.port, function (err) {
  if (err) {
    log.info(`Server has a problem listening on port ${config.port}`)
    log.fatal(err)
  } else {
    log.info(`Port ${config.port} goes "whirrr..."`)
  }
})
