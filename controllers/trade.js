/**
 * Trade Controller
 *
 * @controller trade
 * @return {Class}
 */

'use strict';

let debug = require('debug')('trade_controller');

class trade {

  constructor() {
    debug('exported');
  }
  
  deposit(req, res) {
    App.controllers.user.find(req.session.user.identifier)
      .then(function(docs) {
        if(!docs[0].tradelink || !docs[0]) {
          res.redirect('/tradelink');
        } else {
          res.redirect('https://steamcommunity.com/tradeoffer/new/?partner=323749831');
        }
      });
  }

  receive(req, res) {
    if(req.params.key != '123') {
      res.send('no perms');
      return;
    }

    let identifier = 'https://steamcommunity.com/openid/id/' + req.params.user;

    App.controllers.user.find(identifier)
      .then(function(docs) {
        if(!docs[0]) {
          return;
        }
        App.db.users.update({
          'identifier': identifier
        }, {
          $set: {
            'coins': (Number(docs[0].coins) + Number(req.params.amount)),
            'stats.deposited': (Number(docs[0].stats.deposited) + Number(req.params.amount))
          }
        }, function() {
          debug('User: ' + identifier + ' deposited ' + req.params.amount + ' of coins.');
        });
      });

    res.send('User: ' + req.params.user + ' sent '+ req.params.amount + ' coins.');
  }

  tradelink(req, res) {
    App.controllers.user.find(req.session.user.identifier)
      .then(function(docs) {
        if(docs[0].tradelink != null || !docs[0]) {
          res.redirect('/');
        } else {
          res.render('tradelink');
        }
      });
  }

  setTradeLink(req, res) {
    if(!req.session.user) {
      res.redirect('/auth');
      return;
    }
    
    App.db.users.update({
      'identifier': req.session.user.identifier
    }, {
      $set: {
        'tradelink': req.body.tradelink
      }
    }, function(err) {
      res.redirect('/deposit');
      console.log(err);
    });
  }
}

module.exports = trade;