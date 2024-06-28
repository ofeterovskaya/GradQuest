const express = require('express');
const passport = require('passport');
const router = express.Router();
const csrfProtection = require('../middleware/csrfProtection');

const {
  logonShow,
  registerShow,
  registerDo,
  logoff,
  connectChild,
  connectParentToStudent
} = require('../controllers/sessionController');

router
  .route('/register')
  .get(csrfProtection, registerShow)
  .post(csrfProtection, registerDo);

router
  .route('/logon')
  .get(csrfProtection, logonShow)
  .post(
    csrfProtection,
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/sessions/logon',
      failureFlash: true
    })
  );

router.route('/logoff').post(csrfProtection, logoff);

// Route to handle form submission for connecting a Parent to a Student
router
  .route('/connectStudent')
  .get(csrfProtection, connectChild)
  .post(csrfProtection, connectParentToStudent);

module.exports = router;
