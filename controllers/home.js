/**
 * Home Controller
 *
 * @controller home
 * @return {Class}
 */

'use strict';

let debug = require('debug')('home_controller');

class home {

  constructor() {
    debug('exported');
  }

  render(req, res) {
    res.render('index');
  }

  cups(req, res) {
    res.render('cups');
  }

  roulette(req, res) {
    res.render('roulette');
  }
}

module.exports = home;