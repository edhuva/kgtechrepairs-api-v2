const express = require('express');
const router = express.Router();
const repairRequestsController = require('../controllers/repairRequestsController');
const verifyJWT = require('../middleware/verifyJWT');
//repair request routes
router.use(verifyJWT)

router.route('/')
    .get(repairRequestsController.getAllRepairRequests)
    .post(repairRequestsController.createNewRepairRequest)
    .patch(repairRequestsController.updateRepairRequest)
    .delete(repairRequestsController.deleteRepairRequest);

module.exports = router