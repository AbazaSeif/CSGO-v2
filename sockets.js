/**
 * Sockets
 * A module for socket properties.
 *
 * @module socket
 */

module.exports = function() {
  'use strict';

  let debug = require('debug')('sockets');
  debug('exported');

  App.io.on('connection', function(socket) {
    // Handle new connection
    // App.controllers.game.connection();

    // On bet
    socket.on('bet', (data) => { App.controllers.game.bet(data, socket); });

    // On search
    socket.on('search', (data) => { App.controllers.game.search(data, socket); });

    socket.on('searchTime', (data) => { App.controllers.bombGame.searchTime(data, socket); });
    
    // On roll
    socket.on('roll', (data) => { App.controllers.bombGame.roll(data, socket); });

    // On chat
    socket.on('chat', (data) => { App.controllers.chat.chat(data, socket); });

    // On new player
    socket.on('connected', (data) => { App.controllers.game.connection(socket); });
    socket.on('disconnect', (data) => { App.controllers.game.disconnection(socket); });
  });

};