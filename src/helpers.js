const isLoggedIn = req => {
  return req.user == null ? false : true
}

const getEmail = req => {
  return isLoggedIn(req) ? req.user.email : null
}

const encodeWikiTitle = title => {
  return encodeURIComponent(title.split(' ').join('_'))
}

module.exports = {
  isLoggedIn,
  getEmail,
  encodeWikiTitle
}
