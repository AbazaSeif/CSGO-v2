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
App.roulette.time = 5;
App.roulette.started = false;
App.roulette.roll = false;
App.roulette.preroll = false;

App.roulette.stats = {};
App.roulette.stats.black = {
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
      'black': 0
    };

    if(App.roulette.state == 'betting') {
      App.roulette.stats.black.betters.forEach(function(bet) {
        if(bet.identifier == identifier) {
          bets.black += bet.amount;
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

  searchTotal(socket) {
    let bets = {
      'green': 0,
      'red': 0,
      'black': 0
    };

    if(App.roulette.state == 'betting') {
      App.roulette.stats.black.betters.forEach(function(bet) {
        bets.black += bet.amount;
      });
      App.roulette.stats.red.betters.forEach(function(bet) {
        bets.red += bet.amount;
      });
      App.roulette.stats.green.betters.forEach(function(bet) {
        bets.green += bet.amount;
      });
      socket.emit('totalFound', bets);
    }
  }

  start() {
    let timeInterval = setInterval(() => {
      App.roulette.time = App.roulette.time - 1;
      this.timeEmit();
      if(App.roulette.time == 0) {
        App.roulette.preroll = true;
        clearInterval(timeInterval);
        this.preroll();
      }
    }, 1000);
  }

  timeEmit() {
    App.io.emit('time', {
      'state': App.roulette.state,
      'time': App.roulette.time
    });
  }

  preroll() {
    let totalbets = Number(App.roulette.stats.green.bets) + Number(App.roulette.stats.green.bets) + Number(App.roulette.stats.green.bets);
    let sumGreen = Number(App.roulette.stats.green.total), sumRed = Number(App.roulette.stats.red.total), sumBlack = Number(App.roulette.stats.black.total)
    App.roulette.state = 'rolling';
    App.io.emit('preroll', {
      'sums': {
        '0': sumGreen,
        '1': sumRed,
        '2': sumBlack
      },
      'totalbets': totalbets
    });

    this.spin();
  }

  addUser(data, socket) {
    App.clients[data.identifier] = {
      "socket": socket.id
    };
  }

  spin() {
    let rollN = Math.round(Math.random() * 14);
    let won_red, won_green, won_black, won;
    if(rollN >= 1 && rollN <= 7) {
      won_red = Number(App.roulette.stats.red.total) * 2;
    } else {
      won_red = Number(App.roulette.stats.red.total) * -1;
    } if(rollN >= 8 && rollN <= 14) {
      won_black = Number(App.roulette.stats.black.total) * 2;
    } else {
      won_black = Number(App.roulette.stats.black.total) * -1;
    } if(rollN == 0) {
      won_green = Number(App.roulette.stats.green.total) * 14;
    } else {
      won_green = Number(App.roulette.stats.green.total) * -1;
    }

    App.roulette.stats.red.betters.forEach(function(bet) {
      
      if(rollN >= 1 && rollN <= 7) {
        won = bet.amount * 2;
      } else if(rollN >= 8 && rollN <= 14) {
        won = bet.amount * -1;
      } else if(rollN == 0) {
        won = bet.amount * -1;
      }

      
      debug(bet.identifier);
      debug(App.clients[bet.identifier]);
      debug(rollN);
      debug(won);
      App.io.sockets.connected[App.clients[bet.identifier].socket].emit('spin', {
        roll: rollN,
        //rollid: "1",
        nets: {
          0: {
            swon: Number(App.roulette.stats.green.bets), samount: won_green
          },
          1: {
            swon: Number(App.roulette.stats.red.bets), samount: won_red
          },
          2: {
            swon: Number(App.roulette.stats.black.bets), samount: won_black
          }
        },
        length: "250",
        won: won,
        balance: "500",
        wait: "9",
        wobble: "17"
      });
    });
    App.roulette.stats.black.betters.forEach(function(bet) {
      
      if(rollN >= 1 && rollN <= 7) {
        won = bet.amount * -1;
      } else if(rollN >= 8 && rollN <= 14) {
        won = bet.amount * 2;
      } else if(rollN == 0) {
        won = bet.amount * -1;
      }

      
      debug(bet.identifier);
      debug(App.clients[bet.identifier]);
      debug(rollN);
      debug(won);
      App.io.sockets.connected[App.clients[bet.identifier].socket].emit('spin', {
        roll: rollN,
        //rollid: "1",
        nets: {
          0: {
            swon: Number(App.roulette.stats.green.bets), samount: won_green
          },
          1: {
            swon: Number(App.roulette.stats.red.bets), samount: won_red
          },
          2: {
            swon: Number(App.roulette.stats.black.bets), samount: won_black
          }
        },
        length: "250",
        won: won,
        balance: "500",
        wait: "9",
        wobble: "17"
      });
    });
    App.roulette.stats.green.betters.forEach(function(bet) {
      
      if(rollN >= 1 && rollN <= 7) {
        won = bet.amount * -1;
      } else if(rollN >= 8 && rollN <= 14) {
        won = bet.amount * -1;
      } else if(rollN == 0) {
        won = bet.amount * 2;
      }

      
      debug(bet.identifier);
      debug(App.clients[bet.identifier]);
      debug(rollN);
      debug(won);
      App.io.sockets.connected[App.clients[bet.identifier].socket].emit('spin', {
        roll: rollN,
        //rollid: "1",
        nets: {
          0: {
            swon: Number(App.roulette.stats.green.bets), samount: won_green
          },
          1: {
            swon: Number(App.roulette.stats.red.bets), samount: won_red
          },
          2: {
            swon: Number(App.roulette.stats.black.bets), samount: won_black
          }
        },
        length: "250",
        won: won,
        balance: "500",
        wait: "9",
        wobble: "17"
      });
    });
  
    App.roulette.state = 'betting';
  }

  bet(data, socket) {
    let self = this;

    if(App.roulette.state != 'betting') {
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
    if(['red', 'green', 'black'].indexOf(data.color) == -1) {
      socket.emit('err', {'msg': 'Please choose a color to bet on.'});
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
          return;
        }
        let new_coins = Number(docs[0].coins) - Number(data.amount);
        App.db.users.update({
          'identifier': data.identifier
        }, {
          $set: {
            'coins': new_coins
          }
        }, function(err) {
          if(!App.roulette.started) {
            App.roulette.started = true;
            self.start();
          }

          App.roulette.stats[data.color].bets += 1;
          App.roulette.stats[data.color].total += Number(data.amount);
          App.roulette.stats[data.color].betters.push({
            'identifier': data.identifier,
            'amount': Number(data.amount)
          });

          let mybets = {
            'identifier': data.identifier,
            'id': data.id,
            'username': data.username,
            'avatar': data.avatar,
            'color': data.color,
            'amount': Number(data.amount)
          };

          /* Emit to all clients except the sender
          socket.broadcast.emit('new_bet', App.roulette.stats);
          */

          // Emit to all clients connected
          App.io.emit('new_bet', App.roulette.stats);
          App.io.emit('my_bet', mybets);
          
          socket.emit('betted', {'amount': data.amount, 'color': data.color, 'new_coins': new_coins});
        });
      });
  }
}

module.exports = rouletteGame;