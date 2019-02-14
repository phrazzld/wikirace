// routes/index.js

const router = require('express').Router()
const config = require('@root/config')
const log = config.loggers.dev()
const passport = require('passport')
const querystring = require('querystring')
const cheerio = require('cheerio')
const helpers = require('@root/helpers')
const request = require('request')
const User = require('@models/user').model
const Run = require('@models/run').model

router.get('/', (req, res) => {
  log.info('GET /')
  res.render('home', {
    title: 'Wikirace',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.get('/login', (req, res) => {
  log.info('GET /login')
  res.render('login', {
    title: 'Login',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  log.info('POST to /login')
  return res.redirect('/profile')
})

router.get('/signup', (req, res) => {
  log.info('GET /signup')
  res.render('signup', {
    title: 'Signup',
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.post('/signup', (req, res) => {
  log.info('POST /signup')
  const { body: {
    email,
    password,
    "password-confirmation": passwordConfirmation
  } } = req
  if (!email || !password) {
    return res.status(422).send({ message: 'Invalid email or password' })
  }
  if (password !== passwordConfirmation) {
    return res.status(422).send({ message: 'Password confirmation does not match' })
  }
  const finalUser = new User({ email: email, password: password })
  finalUser.setPassword(password)
  finalUser.save()
    .then((user) => {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    })
    .catch((err) => {
      log.fatal(err)
      res.status(500).send(err)
    })
})

router.get('/logout', (req, res) => {
  log.info('GET /logout')
  req.logout()
  res.redirect('/')
})

router.get('/profile', (req, res) => {
  log.info('GET /profile')
  res.render('profile', {
    title: 'Profile',
    email: helpers.getEmail(req),
    isLoggedIn: helpers.isLoggedIn(req)
  })
})

router.get('/race', (req, res) => {
  log.info('GET /race')
  let randomUrl = 'https://en.wikipedia.org/wiki/Special:Random'
  request(randomUrl, function (finishErr, finishResponse, finishBody) {
    let $ = cheerio.load(finishResponse.body)
    let finish = helpers.encodeWikiTitle($('#firstHeading').text())
    request(randomUrl, function (startErr, startResponse, startBody) {
      $ = cheerio.load(startResponse.body)
      let start = helpers.encodeWikiTitle($('#firstHeading').text())
      res.render('racetrack', {
        title: 'Finish Line',
        isLoggedIn: helpers.isLoggedIn(req),
        start: start,
        finish: finish,
        wiki: finishBody,
        isFinishLine: true
      })
    })
  })
})

router.get('/fetch-wiki/:start/:finish/:next', (req, res) => {
  log.info('GET /fetch-wiki')
  const { params: { start, finish, next } } = req
  log.info(`start: ${start}\nfinish: ${finish}\nnext: ${next}`)
  if (next === finish) {
    log.info('Race complete!')
  }
  let nextUrl = `https://en.wikipedia.org/w/index.php?title=${next}&action=render`
  request(nextUrl, function (err, response, body) {
    res.render('racetrack', {
      title: 'Race - In Progress',
      isLoggedIn: helpers.isLoggedIn(req),
      start: start,
      finish: finish,
      wiki: body,
      isFinishLine: false
    })
  })
})

module.exports = router
