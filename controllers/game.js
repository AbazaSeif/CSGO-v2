/**
 * Game Controller
 *
 * @controller game
 * @return {Class}
 */

'use strict';

let debug = require('debug')('game_controller');

App.game = {};
App.game.state = 'betting';
App.game.players = 0;
App.game.time = 30;
App.game.started = false;

App.game.stats = {};
App.game.stats.blue = {
  'betters': [],
  'bets': 0,
  'total': 0
};

App.game.stats.green = {
  'betters': [],
  'bets': 0,
  'total': 0
};

App.game.stats.red = {
  'betters': [],
  'bets': 0,
  'total': 0
};

class game {

  constructor() {
    debug('exported');
  }

  connection(socket) {
    App.game.players += 1;
    debug(App.game.players);
    socket.emit('new player', {'online': App.game.players});
  }

  disconnection(socket) {
    if(App.game.players > 0) {
      App.game.players -= 1;
    }
    debug(App.game.players);
    socket.emit('remove player', {'online': App.game.players});
  }

  search(identifier, socket) {
    let bets = {
      'green': 0,
      'red': 0,
      'blue': 0
    };

    if(App.game.state == 'betting') {
      App.game.stats.blue.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.blue += bet.amount;
        }
      });
      App.game.stats.red.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.red += bet.amount;
        }
      });
      App.game.stats.green.betters.forEach(function(bet) {
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

  searchTime(data, socket) {
    App.controllers.user.find(data.identifier)
      .then(function(docs) {
        if(!docs[0]) {
          debug('lil error');
          return;
        }
        socket.emit('updateTime', {'time': docs[0].previousRoll});
      });
  }

  timeEmit() {
    App.io.emit('time', {
      'state': App.game.state,
      'time': App.game.time
    });
  }

  roll(data, socket) {
    let self = this;

    App.controllers.user.find(data.identifier)
      .then(function(docs) {
        if(!docs[0]) {
          socket.emit('err', {'msg': 'Please login before rolling.'});
          return;
        }
        let old_time = App.moment(docs[0].previousRoll);
        let now_time = App.moment().subtract(1, 'hours');
        if(!(now_time.isSame(old_time) || now_time.isAfter(old_time)) || docs[0].previousRoll == '' || isNaN(docs[0].previousRoll) || docs[0].previousRoll == null) {
          socket.emit('err', {'msg': "You have to wait before rolling again."});
          socket.emit('updateTime', {'time': docs[0].previousRoll});
          return;
        }
        //let new_time = '01:00:00';
        let new_time = App.moment().add(1, 'hours').toDate();

        let number = Math.floor(Math.random() * 9999);
        let coinsWon = 0;
        
        if(number < 9751) {
          coinsWon = 10;
        } else if(number < 9851) {
          coinsWon = 40;
        } else if(number < 9991) {
          coinsWon = 100;
        } else if(number < 1000) {
          coinsWon = 1000;
        }

        let new_coins = Number(docs[0].coins) + Number(coinsWon);

        App.db.users.update({
          'identifier': data.identifier
        }, {
          $set: {
            'previousRoll': new_time,
            'coins': new_coins
          }
        }, function(err) {
          socket.broadcast.emit('new_roll', number);
          socket.emit('rolled', {'number': number, 'new_time': new_time, 'new_coins': new_coins, 'coinsWon': coinsWon});
          socket.emit('winMsg', {'msg': 'You have won ' + coinsWon + ' coins! You balance has been updated to ' + new_coins + ' coins.'});
        });
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

module.exports = game;