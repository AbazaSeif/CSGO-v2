/**
 * Chat Controller
 *
 * @controller chat
 * @return {Class}
 */

'use strict';

let debug = require('debug')('chat_controller');


class chat {

  constructor() {
    debug('exported');
  }

  connection(socket) {
  }

  chat(data, socket) {
    App.controllers.user.find(data.identifier)
      .then(function(docs) {
        if(!docs[0]) {
          socket.emit('err', {'msg': 'Please login to chat.'});
          return;
        }

        App.io.emit('message', {
          username: data.username,
          message: data.message
        });
        debug(data.message);
        debug(data.username);
      });
  }

  
}

module.exports = chat;