var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , path = require('path')
  , socketio = require('socket.io');


// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Google profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

exports.listen = function(server) {
  var io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    socket.on('watching', function(agent) {
      socket.emit('watching', watching(agent));
    });
  });
}

function watching(agent) {
  return {
    agent: agent,
    watching: []
  }
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://' + process.env.REALM + '/auth/google/return'
  },
  function(accessToken, refereshToken, profile, done) {
    process.nextTick(function () {
      
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.configure(function() {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'nothing to see hear' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/index', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/leaflet', function(req, res){
  res.render('leaflet', { user: req.user });
});

app.get('/election', function(req, res){
  res.render('election', { user: req.user });
});

app.get('/purchase', function(req, res){
  res.render('purchase', { user: req.user });
});

// GET /auth/google
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Google authentication will involve redirecting
// the user to google.com. After authenticating, Google will redirect the
// user back to this application at /auth/google/return
app.get('/auth/google',
  passport.authenticate('google', {scope: 'profile'}));

// GET /auth/google/return
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

console.log("Launching site on port: " + process.env.SITE_PORT);
app.listen(process.env.SITE_PORT);


// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
