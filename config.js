/**
 * Config
 * A module for config properties.
 *
 * @module config
 */

module.exports = function(App) {
  'use strict';

  return {

    db_path: 'mongodb://localhost/csgo',

    db_collections: ['users', 'history', 'items'],

    /**
     * The port that the app will run on.
     * @type {number}
     */
    port: 3000,

    apiKey: 'BA9E88870743CDF5075ABFD67AE33323'
  };
};