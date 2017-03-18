/**
 * User Controller
 *
 * @controller user
 * @return {Class}
 */

'use strict';

let debug = require('debug')('user_controller');

class user {

  constructor() {
    debug('exported');
    this.find();
  }

  /*
   * Find User from Database
   * @return {Promise}
   */
  find(identifier) {
    // Return ES6 Promise
    return new Promise(function(resolve, reject) {
      App.db.users.find({
        'identifier': identifier
      }, function(err, doc) {
        if(err) {
          debug(err);
          reject(new Error(err));
          return;
        }
        resolve(doc);
      });
    });
  }

  /**
   * Register User in Database
   * @return {Promise}
   */
  register(identifier) {
    // Return ES6 Promise
    return new Promise(function(resolve, reject) {
      // Insert into Database
      App.db.users.insert({
        identifier: identifier,
        joined: App.moment().toDate(),
        coins: 0,
        stats: {
          'won': 0,
          'lost': 0,
          'deposited': 0
        },
        referals: {},
        history: [],
        deposited: 0,
        tradelink: null,
        previousRoll: App.moment().toDate()
      }, function(err) {
        if(err) {
          debug(err);
          reject(new Error(err));
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = user;