/**
 * Config
 * A module for config properties.
 *
 * @module config
 */

module.exports = function(App) {
  'use strict';

  return {

    db_path: 'mongodb://csgo-shard-00-00-5a00a.mongodb.net/csgo',

    db_collections: ['users', 'history', 'items'],

    /**
     * The port that the app will run on.
     * @type {number}
     */
    port: 5000,

    apiKey: 'BA9E88870743CDF5075ABFD67AE33323'
  };
};