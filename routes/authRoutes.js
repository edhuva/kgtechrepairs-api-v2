const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');
//auth routes
router.route('/')
    .post(loginLimiter, authController.login)

router.route('/register')
    .post(authController.register)

router.route('/empregister')
    .post(authController.empRegister)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

module.exports = router