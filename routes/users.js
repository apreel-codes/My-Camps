const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)  //render register form
    .post(catchAsync(users.registerUser)); //register user

 router.route('/login')
    .get(users.renderLoginForm) //render login form
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true,}), users.loginUser); //login user


router.get('/logout', users.logoutUser); //logs user out

module.exports = router;