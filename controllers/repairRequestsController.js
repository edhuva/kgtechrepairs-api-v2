const RepairRequest = require('../models/RepairRequest');
const Customer = require('../models/Customer');
const User = require('../models/User');

//@desc         Get all Repeir Requests
//@route        GET /repairrequests
//@access       Private
const getAllRepairRequests = async (req, res) => {
    // Get all repairRequests from mongoDB
    const repairRequests = await RepairRequest.find().lean();

    //if no repair requests
    if (!repairRequests) {
        return res.status(400).json({ message: 'No repair requests'});
    }

    //Add customer username to each repair request before sending the responce
    const repairRequestsWithUsers = repairRequests?.length ? await Promise.all(repairRequests.map(async (request) => {
        const customer = await Customer.findById(request.customer).lean().exec();
        const customerUser = await User.findById(customer.user).lean().exec();

        return { ...request, customer: customerUser.username};
    })) : repairRequests;

    res.json(repairRequestsWithUsers);
}

//desc          Create new Repair Request
//@route        POST /repairrequests
//@access       Private
const createNewRepairRequest = async (req, res) => {
    const { customer, deviceType, serialNo, brand, issueDesc } = req.body;

    //confirm data
    if (!customer || !deviceType || !serialNo || !brand || !issueDesc) {
        return res.status(400).json({ message: 'All fields are required'});
    }

    //check if customer exist
    const customerexist = await Customer.findById(customer).exec();

    if (!customerexist) {
        return res.status(400).json({ message: 'Customer does not exist'});
    }

    //check for duplicate
    const duplicate = await RepairRequest.findOne({ serialNo }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate serial Number'});
    }

    
    //create and store the new rapair request
    const repairRequest = await RepairRequest.create({ customer, deviceType, serialNo, brand, issueDesc });

    if (repairRequest) {
        return res.status(201).json({ message: 'New repair Request created' });
    } else {
        return res.status(400).json({ message: 'Invalid repair request recieved' });
    }
}

//@desc         Update repair request 
//@route        PATCH /repairrequests
//@access       Private
const updateRepairRequest = async (req, res) => {
    const { id, customer, deviceType, serialNo, brand, issueDesc, status } = req.body;

    //confirm data
    if (!id || !customer || !deviceType || !serialNo || !brand || !issueDesc || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are Required'});
    }

    //confirm repair request exist
    const repairRequest = await RepairRequest.findById(id).exec();

    if (!repairRequest) {
        return res.status(400).json({ message: 'Repair Request not found'});
    }

    //check for duplicate serialNo
    const duplicate = await RepairRequest.findOne({ serialNo}).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: `Dulicate Request with serialNo ${serialNo}` });
    }

    repairRequest.customer = customer;
    repairRequest.deviceType = deviceType;
    repairRequest.serialNo = serialNo;
    repairRequest.brand = brand;
    repairRequest.issueDesc = issueDesc;
    repairRequest.status = status;

    const updatedRepairRequest = await repairRequest.save();

    res.json(`Repair Request '${updatedRepairRequest._id}' updated`);
}

//@desc         Delete repair request
//@route        DELETE /repairrequests
//@access       Private
const deleteRepairRequest = async (req, res) => {
    const { id } = req.body;

    //confirm data
    if (!id) {
        return res.status(400).json({ message: 'Repair Repair Request ID Required' });
    }

    //confirm repair request exists to delete
    const repairRequest = await RepairRequest.findById(id).exec();

    if (!repairRequest) {
        return res.status(400).json({ message: 'Repair Request not found'});
    }

    await repairRequest.deleteOne();

    const reply = `Repair Request with ID '${repairRequest._id}' deleted`;

    res.json(reply);
}

module.exports = {
    getAllRepairRequests,
    createNewRepairRequest,
    updateRepairRequest,
    deleteRepairRequest
}