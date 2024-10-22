const passportLogin = require('./localStrategy');
const googleLogin = require('./googleStrategy');
const githubLogin = require('./githubStrategy');
const discordLogin = require('./discordStrategy');
const facebookLogin = require('./facebookStrategy');
const larkLogin = require('./larkStrategy');
const aroLogin = require('./aroStrategy');
const biLogin = require('./biStrategy');
//const larkStrategy = require('./larkStrategy');
const setupOpenId = require('./openidStrategy');
const jwtLogin = require('./jwtStrategy');

module.exports = {
  passportLogin,
  googleLogin,
  githubLogin,
  discordLogin,
  jwtLogin,
  facebookLogin,
  setupOpenId,
  larkLogin,
  aroLogin,
  biLogin,
  //larkStrategy,
};
