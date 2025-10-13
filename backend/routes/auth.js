require('dotenv').config();
const express = require('express');
const passport = require('passport');
const {
    createUser,
    loginUser,
    logout,
    setForgotPassToken,
    forgotpass,
    updateProfile,
    createHospital,
    checkAuthStatus,
    addDoctor
} = require('../control/auth');
const { isAuth } = require('../common/common');

const router = express.Router();

router
    .post('/login', passport.authenticate('local'), loginUser)
    .post('/register', createUser)
    .post('/hospitalreg', createHospital)
    .get('/logout', logout)
    .get('/check', isAuth, checkAuthStatus)
    .get('/google', passport.authenticate('google', { scope: ["profile", "email"] }))
    .get('/google/callback', passport.authenticate("google"), (req, res) => {
        res.redirect(process.env.REDIRECT_DASHBOARD);
    })
    .post('/reset-request', setForgotPassToken)
    .post('/password-reset', forgotpass)
    .patch('/profileupdate', isAuth, updateProfile)
    .patch('/update/doctor', isAuth, addDoctor);

exports.router = router;