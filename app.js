var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var passport = require('passport');
//var cookieSession = require('cookie-session')
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
require('dotenv').load()
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
console.log('sanity  check')
console.log(process.env)
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'alex'
}))
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
  }, function(accessToken, refreshToken, profile, done) {
    console.log(arguments);
    done(null, {id: profile.id, displayName: profile.displayName})
  }));

  passport.serializeUser(function(user, done) {
    console.log(arguments)
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    console.log(arguments)
    done(null, user)
  });

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    console.log('hello')
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/failure'
}), function (req, res) {
  res.redirect('/')
});

app.get('/auth/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

// right above app.use('/', routes);
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})

app.use('/', routes);
app.use('/users', users);


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
