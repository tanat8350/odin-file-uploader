const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
const passport = require('passport');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const indexRouter = require('./routes/index');
const authenticateRouter = require('./routes/authenticate');
const fileRouter = require('./routes/file');
const folderRouter = require('./routes/folder');
const shareRouter = require('./routes/share');

const app = express();

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: new PrismaSessionStore(require('./config/prisma'), {
      checkPeriod: 2 * 60 * 1000, //ms
    }),
  })
);
app.use(passport.session());
require('./config/authentication');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const checkLoggedin = require('./middlewares/checkLoggedin');

app.use('/', indexRouter);
app.use('/', authenticateRouter);
app.use('/file', checkLoggedin, fileRouter);
app.use('/folder', checkLoggedin, folderRouter);
app.use('/share', shareRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
