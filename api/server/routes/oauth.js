// file deepcode ignore NoRateLimitingForLogin: Rate limiting is handled by the `loginLimiter` middleware

const passport = require('passport');
const express = require('express');
const router = express.Router();
const { setAuthTokens } = require('~/server/services/AuthService');
const { loginLimiter, checkBan, checkDomainAllowed } = require('~/server/middleware');
const { logger } = require('~/config');

const domains = {
  client: process.env.DOMAIN_CLIENT,
  server: process.env.DOMAIN_SERVER,
};

router.use(loginLimiter);

const oauthHandler = async (req, res) => {
  try {
    await checkDomainAllowed(req, res);
    await checkBan(req, res);
    if (req.banned) {
      return;
    }
    await setAuthTokens(req.user._id, res);
    res.redirect(domains.client);
  } catch (err) {
    logger.error('Error in setting authentication tokens:', err);
  }
};

/**
 * Google Routes
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['openid', 'profile', 'email'],
    session: false,
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['openid', 'profile', 'email'],
  }),
  oauthHandler,
);

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile'],
    profileFields: ['id', 'email', 'name'],
    session: false,
  }),
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['public_profile'],
    profileFields: ['id', 'email', 'name'],
  }),
  oauthHandler,
);

router.get(
  '/openid',
  passport.authenticate('openid', {
    session: false,
  }),
);

router.get(
  '/openid/callback',
  passport.authenticate('openid', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
  }),
  oauthHandler,
);

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email', 'read:user'],
    session: false,
  }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['user:email', 'read:user'],
  }),
  oauthHandler,
);
router.get(
  '/discord',
  passport.authenticate('discord', {
    scope: ['identify', 'email'],
    session: false,
  }),
);

router.get(
  '/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['identify', 'email'],
  }),
  oauthHandler,
);

router.get(
  '/lark',
  passport.authenticate('lark', {
    scope: ['profile', 'email', 'phone'],
    session: false,
    failureMessage: true,
    failWithError: true,
  }),
);

router.get(
  '/lark/callback',
  passport.authenticate('lark', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['profile', 'email', 'phone'],
  }),
  oauthHandler,
);

router.get(
  '/aro',
  passport.authenticate('aro', {
    scope: ['profile', 'email', 'phone'],
    session: false,
    failureMessage: true,
    failWithError: true,
  }),
);

router.get(
  '/aro/callback',
  passport.authenticate('aro', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['profile', 'email', 'phone'],
  }),
  oauthHandler,
);

router.get(
  '/bi',
  passport.authenticate('bi', {
    scope: ['profile', 'email', 'phone'],
    session: false,
    failureMessage: true,
    failWithError: true,
  }),
);

router.get(
  '/bi/callback',
  passport.authenticate('bi', {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ['profile', 'email', 'phone'],
  }),
  oauthHandler,
);

module.exports = router;
