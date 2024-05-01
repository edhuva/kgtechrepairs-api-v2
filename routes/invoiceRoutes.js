const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoicesController');
const verifyJWT = require('../middleware/verifyJWT');
//invoice routes
router.use(verifyJWT)

router.route('/')
    .get(invoiceController.getAllInvoices)
    .post(invoiceController.createNewInvoice)
    .patch(invoiceController.updateInvoice)
    .delete(invoiceController.deleteInvoice)

module.exports = router