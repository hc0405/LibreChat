const passport = require('passport');
const { Strategy: LarkStrategy } = require('passport-oauth2');
const { logger } = require('~/config');
const User = require('~/models/User');
async function larkLogin() {
  const larkStrategy = new LarkStrategy(
    {
      authorizationURL: 'https://anycross-sg.larksuite.com/sso/LJYVD7PB6K6/oauth2/auth',
      tokenURL: 'https://anycross-sg.larksuite.com/sso/LJYVD7PB6K6/oauth2/token',
      clientID: process.env.LARK_CLIENT_ID,
      clientSecret: process.env.LARK_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_SERVER}${process.env.LARK_CALLBACK_URL}`,
      scope: ['profile', 'email'],
    },
    larkCB,
  );

  larkStrategy.userProfile = function (accessToken, done) {
    this._userProfileURL = 'https://anycross-sg.larksuite.com/sso/LJYVD7PB6K6/oauth2/userinfo';
    this._oauth2.get(this._userProfileURL, accessToken, function (err, body) {
      if (err) {
        return done(err);
      }

      let json;
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return done(new Error('Failed to parse user profile'));
      }

      const profile = {
        provider: 'lark',
        email: json.email,
        displayName: `${json.name}(${json.another_name})`,
        name: json.name,
        another_name: json.another_name,
        avatar: json.picture,
        _raw: body,
        _json: json,
      };

      done(null, profile);
    });
  };
  passport.use('lark', larkStrategy);
}

const larkCB = async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.email;
    const oldUser = await User.findOne({ email });
    const ALLOW_SOCIAL_REGISTRATION =
      process.env.ALLOW_SOCIAL_REGISTRATION?.toLowerCase() === 'true';

    if (oldUser) {
      oldUser.avatar = profile.avatar;
      await oldUser.save();
      return cb(null, oldUser);
    } else if (ALLOW_SOCIAL_REGISTRATION) {
      const newUser = await new User({
        provider: 'lark',
        username: profile.name,
        email,
        name: profile.displayName,
        avatar: profile.avatar,
      }).save();

      return cb(null, newUser);
    }

    return cb(null, false, { message: 'User not found.' });
  } catch (err) {
    logger.error('[larkLogin]', err);
    return cb(err);
  }
};

module.exports = larkLogin;
