const passport = require('passport');
const { Strategy: BiStrategy } = require('passport-oauth2');
const { logger } = require('~/config');
const User = require('~/models/User');
async function biLogin() {
  const biStrategy = new BiStrategy(
    {
      authorizationURL: 'https://anycross-sg.larksuite.com/sso/LEX0R74XXK1/oauth2/auth',
      tokenURL: 'https://anycross-sg.larksuite.com/sso/LEX0R74XXK1/oauth2/token',
      clientID: 'acb92d875b1a994570a602b5efb2145b05',
      clientSecret: 'GjfKmQ-wR3JzLVkdUgntpxkTgV4Y0ZxHs4CmQyqZAls',
      callbackURL: `${process.env.DOMAIN_SERVER}/oauth/bi/callback`,
      scope: ['profile', 'email', 'phone'],
      customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    biCB,
  );

  logger.info(` Client ID: ${biStrategy._oauth2._clientId}`);

  biStrategy.userProfile = function (accessToken, done) {
    logger.info('Bi Get User Info');
    this._userProfileURL = 'https://anycross-sg.larksuite.com/sso/LEX0R74XXK1/oauth2/userinfo';
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
      let emailExist = json.email || json.enterprise_email;
      let result = '';

      if (emailExist) {
        result += emailExist;
      }
      if (emailExist && json.phone_number) {
        result += '_';
      }
      if (json.phone_number) {
        result += json.phone_number;
      }
      if (json.short_phone_number) {
        result += '(' + json.short_phone_number + ')';
      }
      if (!emailExist) {
        result += '@yohofate.com';
      }
      const profile = {
        provider: 'bi',
        email: result,
        displayName: `${json.name}(${json.another_name})`,
        name: json.name,
        another_name: json.another_name,
        avatar: json.picture,
        _raw: body,
        _json: json,
      };
      logger.error('[biLogin]', 'profile result:' + result);
      done(null, profile);
    });
  };
  passport.use('bi', biStrategy);
}

const biCB = async (accessToken, refreshToken, profile, cb) => {
  try {
    logger.error('[biLogin] -1');
    const email = profile.email;

    logger.error('[bioLogin] 0', profile);
    console.log(JSON.stringify(profile, null, 2));
    const oldUser = await User.findOne({ email });
    const ALLOW_SOCIAL_REGISTRATION =
      process.env.ALLOW_SOCIAL_REGISTRATION?.toLowerCase() === 'true';

    if (oldUser) {
      oldUser.avatar = profile.avatar;
      logger.error('[biLogin] 1', '1');
      await oldUser.save();
      logger.error('[biLogin] 2', '2');
      return cb(null, oldUser);
    } else if (ALLOW_SOCIAL_REGISTRATION) {
      logger.error('[biLogin] 3', '3');
      const newUser = await new User({
        provider: 'bi',
        username: profile.name,
        email,
        name: profile.displayName,
        avatar: profile.avatar,
      }).save();
      logger.error('[biLogin] 4', email);
      return cb(null, newUser);
    }

    return cb(null, false, { message: 'User not found.' });
  } catch (err) {
    logger.error('[biLogin]', err);
    return cb(err);
  }
};

module.exports = biLogin;
