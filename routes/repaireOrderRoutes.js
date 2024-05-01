const express = require('express');
const router = express.Router();
const repairOrdersController = require('../controllers/repairOrdersController');
const verifyJWT = require('../middleware/verifyJWT');
//repair orders routes
router.use(verifyJWT)

router.route('/')
    .get(repairOrdersController.getAllRepairOrders)
    .post(repairOrdersController.createNewRepairOrder)
    .patch(repairOrdersController.updateRepairOrder)
    .delete(repairOrdersController.deleteRepairOrder)

module.exports = router