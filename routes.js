/**
 * Routes
 * A module for route properties.
 *
 * @module routes
 */

module.exports = function() {
  'use strict';

  let debug = require('debug')('routes');
  debug('exported');

  App.Express.get('*', App.controllers.utils.setUser);

  // Home Route
  App.Express.get('/', App.controllers.home.render);

  // Login Route
  App.Express.get('/auth', App.controllers.auth.login);

  // Login Return Route
  App.Express.get('/auth/return', App.controllers.auth.login);

  // Logout Route
  App.Express.get('/logout', App.controllers.auth.logout);

  // Deposit Route
  App.Express.get('/deposit', App.controllers.trade.deposit);

  // Recieve Route
  App.Express.get('/api/receive/:key/:user/:amount', App.controllers.trade.receive);

  // Tradelink Route
  App.Express.get('/tradelink', App.controllers.trade.tradelink);

  // Set Tradelink Route
  App.Express.post('/setTradeLink', App.controllers.trade.setTradeLink);

  // Cups Route
  App.Express.get('/cups', App.controllers.home.cups);

  // Roulette Route
  App.Express.get('/roulette', App.controllers.home.roulette);

  // 404 Route
  App.Express.get('*', App.controllers.utils.notFound);
};