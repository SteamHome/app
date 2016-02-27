var express = require('express'),
    session = require('express-session'),
    sessionstore = require('sessionstore'),
    cradle = require('cradle'),
    flash = require('connect-flash'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    util = require('util'),
    steam = require('steam-web'),
    swig = require('swig'),
    SteamStrategy = require('passport-steam').Strategy,
    conf = require('./conf.json');

Error.stackTraceLimit = 15;

steamid = require('steamidconvert')(conf.steam_key);

cradle.setup({
    host: 'localhost',
    cache: true,
    raw: false,
    forceSave: true,
    auth: { username: 'admin', password: conf.couch_pass}
  });

var c = new(cradle.Connection)();

var users = c.database('users');
users.exists(function (err, exists){
  if(!exists) { users.create(); }
})

var routes = require('./routes/index');
var auth = require('./routes/auth');

var app = express();

passport.use(new SteamStrategy({
    returnURL: conf.steam_return,
    realm: conf.steam_realm,
    apiKey: conf.steam_key
  },
  function(identifier, profile, done) {
    console.log(identifier, profile);
    process.nextTick(function () {

      users.get(profile.id, function (err, doc) {


        console.log('err', err);
        if(err && err.error == 'not_found'){
          users.save(profile.id, {}, function (err, data) {
              if(err) { console.log('error touching user ( ͡° ͜ʖ ͡°) '+err); }
              else { console.log('Saved user '+profile.displayName); }
              return done(null, profile);
          });
        }
        else if(err) { console.log('Error getting user', err); }
        else {

          profile.identifier = identifier;
          return done(null, profile);
        }
      });


    });
  }
));

s = new steam({
  apiKey: conf.steam_key,
  format: 'json'
});


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// view engine setup
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

swig.setDefaults({ cache: false });

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: conf.cookie,
    resave: true,
    saveUninitialized: true,
    store: sessionstore.createSessionStore({
      type: 'couchdb'
    })
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', routes);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
