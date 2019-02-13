const isLoggedIn = req => {
  return req.user == null ? false : true
}

const getEmail = req => {
  return isLoggedIn(req) ? req.user.email : null
}

module.exports = {
  isLoggedIn,
  getEmail
}
