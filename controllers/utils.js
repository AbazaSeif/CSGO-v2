/**
 * Utils Controller
 *
 * @controller utils
 * @return {Class}
 */

'use strict';

let debug = require('debug')('utils_controller');

class utils {

  constructor() {
    debug('exported');
  }

  notFound(req, res) {
    res.render('404');
  }

  setUser(req, res, next) {
    if(req.session.user) {
      App.db.users.find({
        'identifier': req.session.user.identifier
      }, function(err, docs) {
        if(!docs[0]) {
          delete req.session.user;
          return;
        } else {
          req.session.user.coins = docs[0].coins;
          req.session.user.profit = Number(docs[0].stats.won) - Number(docs[0].stats.lost);
          res.locals.user = req.session.user;
          next();
        }
      });
    } else {
      next();
    }
  }
}

module.exports = utils;