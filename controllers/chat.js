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

        if((data.message.length !== 0 || data.message !== "") && data.message.replace(/\s/g, '').length !== 0) {
          App.io.emit('message', {
            username: data.username,
            message: data.message
          });

          debug(data.username);
          debug(data.message);
        }
      });
  }

  
}

module.exports = chat;