/**
 * Auth Controller
 *
 * @controller auth
 * @return {Class}
 */

'use strict';

let debug = require('debug')('auth_controller');

class auth {

  constructor() {
    debug('exported');
  }

  // Login logic
  login(req, res, next) {
    // Authenticate with Passport.js
    App.passport.authenticate('steam', function(err, user) {
      // Error occured
      if(err) {
        debug(err);
        res.send('An error has occured while trying to login. Please try again later');
      } else {
        req.session.user = user;
      }
      // Set session variable.
      res.redirect('/');
    })(req, res, next);
  }

  // Logout logic
  logout(req, res) {
    if(req.session.user)
      delete req.session.user;
    if(res.locals.user)
      delete res.locals.user;
    res.redirect('/');
  }

  // Passport identification logic
  passportLogic(identifier, profile, done) {
    process.nextTick(function() {
      profile.identifier = identifier;
      // Search User Database for Identifier
      App.controllers.user.find(identifier).then(function(doc) {
        if(!doc[0]) {
          // Register
          App.controllers.user.register(identifier).then(function() {
            return done(null, profile);
          }, function(err) {
            return done(err, null);
          });
        } else {
          // Login
          return done(null, profile);
        }
      }, function(err) {
        // Send Error
        return done(err, null);
      });
    });
  }
}

module.exports = auth;