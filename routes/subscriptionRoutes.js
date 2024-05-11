const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionController');
const verifyJWT = require('../middleware/verifyJWT');


//contact routes private
router.use(verifyJWT)

router.route('/')
    .get(subscriptionsController.getAllSubscriptions)
    .patch(subscriptionsController.updateSubscription)
    .delete(subscriptionsController.deleteSubscription)

module.exports = router