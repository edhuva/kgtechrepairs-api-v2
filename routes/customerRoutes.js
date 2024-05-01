const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const verifyJWT = require('../middleware/verifyJWT');
//customer routes
router.use(verifyJWT)

router.route('/')
    .get(customersController.getAllCustomers)
    .post(customersController.createNewCustomer)
    .patch(customersController.updateCustomer);

module.exports = router