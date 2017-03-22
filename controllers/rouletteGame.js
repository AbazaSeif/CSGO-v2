/**
 * Game Controller
 *
 * @controller rouletteGame
 * @return {Class}
 */

'use strict';

let debug = require('debug')('rouletteGame_controller');

App.roulette = {};
App.roulette.state = 'betting';
App.roulette.time = 30;
App.roulette.started = false;

App.roulette.stats = {};
App.roulette.stats.blue = {
  'betters': [],
  'bets': 0,
  'total': 0
};

App.roulette.stats.green = {
  'betters': [],
  'bets': 0,
  'total': 0
};

App.roulette.stats.red = {
  'betters': [],
  'bets': 0,
  'total': 0
};

class rouletteGame {

  constructor() {
    debug('exported');
  }

  search(identifier, socket) {
    let bets = {
      'green': 0,
      'red': 0,
      'blue': 0
    };

    if(App.roulette.state == 'betting') {
      App.roulette.stats.blue.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.blue += bet.amount;
        }
      });
      App.roulette.stats.red.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.red += bet.amount;
        }
      });
      App.roulette.stats.green.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.green += bet.amount;
        }
      });
      socket.emit('found', bets);
    }
  }

  start() {
    setInterval(() => {
      App.game.time = App.game.time - 1;
      this.timeEmit();
      this.timeR();
    }, 1000);
  }

  timeEmit() {
    App.io.emit('time', {
      'state': App.game.state,
      'time': App.game.time
    });
  }

  bet(data, socket) {
    let self = this;

    if(App.game.state != 'betting') {
      socket.emit('err', {'msg': 'You cannot bet at the moment as there is no round going on.'});
      return;
    } 
    if(isNaN(Number(data.amount))) {
      socket.emit('err', {'msg': 'You can only bet a number of coins!'});
      return;
    } 
    if(Number(data.amount) < 1) {
      socket.emit('err', {'msg': 'You cannot bet less than 1 coin!'});
      return;
    } 
    if(['red', 'green', 'blue', 'gold'].indexOf(data.color) == -1) {
      socket.emit('err', {'msg': 'Please choose a cup to bet on.'});
      return;
    }


    App.controllers.user.find(data.identifier)
      .then(function(docs) {
        if(!docs[0]) {
          socket.emit('err', {'msg': 'Please login before betting.'});
          return;
        } 
        if(Number(data.amount) > Number(docs[0].coins)) {
          socket.emit('err', {'msg': "You don't have enough coins."});
        }
        let new_coins = Number(docs[0].coins) - Number(data.amount);
        App.db.users.update({
          'identifier': data.identifier
        }, {
          $set: {
            'coins': new_coins
          }
        }, function(err) {
          if(!App.game.started) {
            App.game.started = true;
            self.start();
          }

          App.game.stats[data.color].bets += 1;
          App.game.stats[data.color].total += data.amount;
          App.game.stats[data.color].betters.push({
            'identifier': data.identifier,
            'amount': Number(data.amount)
          });

          socket.broadcast.emit('new_bet', App.game.stats);
          socket.emit('betted', {'amount': data.amount, 'color': data.color, 'new_coins': new_coins});
        });
      });
  }
}

module.exports = rouletteGame;