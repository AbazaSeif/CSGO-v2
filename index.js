// CSGO

'use strict';

var bodyParser = require('body-parser');

global.App = {};

// TODO: put this in config.
process.env.DEBUG = 'index, routes, auth_controller, home_controller, utils_controller, user_controller, trade_controller, sockets, chat_controller, game_controller, bombGame_controller, rouletteGame_controller';

var debug = require('debug')('index'),
    expressHbs = require('express-handlebars');

debug('Server started');

/**
 * Require Express dependency.
 * Run express dependency on alias.
 * @see {@link http://expressjs.com/4x/api.html}
 */

const express = require('express');
App.Express = express();
debug('Express dependency loaded.');

/**
 * Assign express-session an alias.
 * express-session is middleware for Express.
 * @see {@link https://github.com/expressjs/session}
 */
App.Sessions = require('express-session');
debug('express-session dependency loaded.');

/**
 * Assign connect-mongo dependency an alias.
 * connect-mongo is a MongoDB session store for Express.
 * @see {@link https://github.com/kcbanner/connect-mongo}
 */
App.SessionStore = require('connect-mongo')(App.Sessions);
debug('connect-mongo dependency loaded.');

App.http = require('http').Server(App.Express);

/**
 * Assign socket.io dependency an alias.
 * Socket.IO enables real-time bidirectional event-based communication.
 * @see {@link https://socket.io}
 */
App.io = require('socket.io')(App.http);
debug('socket.io dependency loaded.');

/**
 * Assign moment.js dependency an alias.
 * Parse, validate, manipulate, and display dates in JavaScript..
 * @see {@link https://momentjs.com/}
 */
App.moment = require('moment-timezone');
App.moment.tz.setDefault("America/New_York");
debug('moment.js dependency loaded.');

/**
 * Assign util dependency an alias.
 */

App.util = require('util');
debug('util dependency loaded');

/**
 * Assign passport-steam dependency an alias.
 * Passport strategy for authenticating with Steam using OpenID 2.0.
 * @see {@link https://github.com/jaredhanson/passport}
 */
App.passport = require('passport');
App.SteamStrategy = require('passport-steam').Strategy;
debug('passport-steam dependency loaded');

/**
 * Assign shortid dependency an alias.
 * shortid is an Amazingly short non-sequential url-friendly unique id generator.
 * @see {@link https://github.com/dylang/shortid}
 */
App.shortid = require('shortid');
debug('shortid dependency loaded.');

/** Initialise config */
App.config = require('./config.js')(App);
debug('config initialised');

/** Initialise database */
App.db = require('mongojs')(App.config.db_path, App.config.db_collections);
debug('db initialised.');

/**
 * Configure sessions.
 */
App.Express.use(App.Sessions({
  secret: 'wowtoZJVxpdk5736=99',  
  name: 'id',
  genid: function(req) {
    return App.shortid.generate();
  },
  saveUninitialized: false,
  resave: false,
  store: new App.SessionStore({
    url: App.config.db_path,
    collection: 'sessions'
  })
}));
debug('sessions configured.');
  
/**
 * Mount body-parser middleware
 * @todo Review code. This code is legacy which has been brought in from previous projects.
 */
App.Express.use(bodyParser.urlencoded({extended: false}));
App.Express.use(bodyParser.json('application/json'));
debug('bodyParser middleware mounted.');

/** Initialise controllers */
App.controllers = App.controllers || {};

App.controllers.home = require('./controllers/home.js');
App.controllers.home = new App.controllers.home();

App.controllers.utils = require('./controllers/utils.js');
App.controllers.utils = new App.controllers.utils();

App.controllers.auth = require('./controllers/auth.js');
App.controllers.auth = new App.controllers.auth();

App.controllers.user = require('./controllers/user.js');
App.controllers.user = new App.controllers.user();

App.controllers.trade = require('./controllers/trade.js');
App.controllers.trade = new App.controllers.trade();

App.controllers.chat = require('./controllers/chat.js');
App.controllers.chat = new App.controllers.chat();

App.controllers.game = require('./controllers/game.js');
App.controllers.game = new App.controllers.game();

App.controllers.bombGame = require('./controllers/bombGame.js');
App.controllers.bombGame = new App.controllers.bombGame();

App.controllers.rouletteGame = require('./controllers/rouletteGame.js');
App.controllers.rouletteGame = new App.controllers.rouletteGame();

App.passport.serializeUser(function(user, done) {
  done(null, user);
});

App.passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

App.passport.use(new App.SteamStrategy({
    returnURL: 'http://localhost:3000/auth/return',
    realm: 'http://localhost:3000/auth',
    /*returnURL: 'http://thihxm.herokuapp.com:5000/auth/return',
    realm: 'http://thihxm.herokuapp.com:5000/auth',*/
    apiKey: App.config.apiKey
  }, App.controllers.auth.passportLogic
));

App.Express.use(App.passport.initialize());
App.Express.use(App.passport.session());

/** Set the view engine used to parse templates and views */
App.Express.set('views', __dirname + '/views');
App.Express.engine('hbs', expressHbs({extname:'hbs', defaultLayout: __dirname + '/views/layouts/main.hbs'}));
App.Express.set('view engine', 'hbs');
debug('view engine set.');

/** Set up virtual paths for static files */
App.Express.use(express.static(__dirname + '/public'));
debug('virtual paths set up.');

/** Initialise routes */
require('./routes.js')();
require('./sockets.js')();
debug('routes required');

/** Start server listening on configured port */
//App.http.listen(App.config.port);
App.http.listen(App.config.port);
debug('running on port ' + App.config.port + '.');