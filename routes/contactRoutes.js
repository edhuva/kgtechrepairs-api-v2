const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactsController');
const verifyJWT = require('../middleware/verifyJWT');

//contact routes private
router.use(verifyJWT)

router.route('/')
    .get(contactController.getAllContacts)
    .patch(contactController.updateContact)
    .delete(contactController.deleteContact)

module.exports = router