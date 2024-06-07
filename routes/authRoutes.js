const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');
const multer = require('multer');

//Multer config
const storage = multer.memoryStorage();
const upload = multer({storage});

//auth routes
router.route('/')
    .post(loginLimiter, authController.login)

router.route('/register')
    .post(authController.register)

router.route('/empregister')
    .post(authController.empRegister)

router.route('/subscriptions')
    .post(authController.createNewSubscription)

router.route('/contacts')
    .post(authController.createNewContact)

router.route('/images')
    .post(upload.single('file'), authController.uploadNewImage)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

module.exports = router