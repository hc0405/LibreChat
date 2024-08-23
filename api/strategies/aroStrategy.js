const passport = require('passport');
const { Strategy: AroStrategy } = require('passport-oauth2');
const { logger } = require('~/config');
const User = require('~/models/User');
async function aroLogin() {
  const aroStrategy = new AroStrategy(
    {
      authorizationURL: 'https://anycross-sg.larksuite.com/sso/LMZ1NVYB9K1/oauth2/auth',
      tokenURL: 'https://anycross-sg.larksuite.com/sso/LMZ1NVYB9K1/oauth2/token',
      clientID: 'acfdaceda3b31047a285a578fa6dc296a7',
      clientSecret: 'SCiQEb_FoT5im48jxU5MRuq2TQGakg2tzHukOK2NC5g',
      callbackURL: `${process.env.DOMAIN_SERVER}/oauth/aro/callback`,
      scope: ['profile', 'email', 'phone'],
      customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    aroCB,
  );

  logger.info(` Client ID: ${aroStrategy._oauth2._clientId}`);

  aroStrategy.userProfile = function (accessToken, done) {
    logger.info('Aro Get User Info');
    this._userProfileURL = 'https://anycross-sg.larksuite.com/sso/LMZ1NVYB9K1/oauth2/userinfo';
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
        provider: 'aro',
        email: result,
        displayName: `${json.name}(${json.another_name})`,
        name: json.name,
        another_name: json.another_name,
        avatar: json.picture,
        _raw: body,
        _json: json,
      };
      logger.error('[aroLogin]', 'profile result:' + result);
      done(null, profile);
    });
  };
  passport.use('aro', aroStrategy);
}

const aroCB = async (accessToken, refreshToken, profile, cb) => {
  try {
    logger.error('[aroLogin] -1');
    const email = profile.email;

    logger.error('[aroLogin] 0', profile);
    console.log(JSON.stringify(profile, null, 2));
    const oldUser = await User.findOne({ email });
    const ALLOW_SOCIAL_REGISTRATION =
      process.env.ALLOW_SOCIAL_REGISTRATION?.toLowerCase() === 'true';

    if (oldUser) {
      oldUser.avatar = profile.avatar;
      logger.error('[aroLogin] 1', '1');
      await oldUser.save();
      logger.error('[aroLogin] 2', '2');
      return cb(null, oldUser);
    } else if (ALLOW_SOCIAL_REGISTRATION) {
      logger.error('[aroLogin] 3', '3');
      const newUser = await new User({
        provider: 'aro',
        username: profile.name,
        email,
        name: profile.displayName,
        avatar: profile.avatar,
      }).save();
      logger.error('[aroLogin] 4', email);
      return cb(null, newUser);
    }

    return cb(null, false, { message: 'User not found.' });
  } catch (err) {
    logger.error('[aroLogin]', err);
    return cb(err);
  }
};

module.exports = aroLogin;
