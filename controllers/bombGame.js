/**
 * Game Controller
 *
 * @controller bombGame
 * @return {Class}
 */

'use strict';

let debug = require('debug')('bombGame_controller');

class bombGame {

  constructor() {
    debug('exported');
  }

  searchTime(data, socket) {
    App.controllers.user.find(data.identifier)
      .then(function(docs) {
        if(!docs[0]) {
          return;
        }
        socket.emit('updateTime', {'time': docs[0].previousRoll});
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
}

module.exports = bombGame;