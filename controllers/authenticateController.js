const { body, validationResult } = require('express-validator');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = {
  getSignUp: (req, res) => {
    res.render('signup', { title: 'Sign Up' });
  },

  postSignUp: [
    body('username')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Username must be at least 8 characters long')
      .isAlphanumeric()
      .withMessage('Username must be alphanumeric')
      .custom(async (value) => {
        const user = await prisma.user.findUnique({
          where: { username: value },
        });
        if (user) {
          throw new Error('Username already exists');
        }
      }),
    body('password')
      .isLength({ min: 8 })
      .withMessage('password must be at least 8 characters long'),
    body('passwordConfirmation')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('passwords must match'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('signup', {
          title: 'Sign up',
          username: req.body.username,
          errors: errors.array(),
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          password: await bcrypt.hash(req.body.password, 10),
        },
      });
      if (!created) {
        return next({ status: 404, message: 'Fail to create user' });
      }
      res.redirect('/login');
    },
  ],

  getLogin: (req, res) => {
    res.render('login', { title: 'Login' });
  },

  postLogin: passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),

  getLogout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  },
};
