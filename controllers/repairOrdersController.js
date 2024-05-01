const RepairOrder = require('../models/RepairOrder');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

//@desc         Get all repairOrders
//@route        GET /repairorders
//@access       Private
const getAllRepairOrders = async (req, res) => {
    // Get all repairOrders from mongoDB
    const repairOrders = await RepairOrder.find().lean();

    //if no repair orders
    if (!repairOrders?.length) {
        return res.status(400).json({ message: 'No repair orders found'});
    }

    // Add customer and employee username to each repair order before sending the response
    const repairOrdersWithUers = await Promise.all(repairOrders.map(async (order) => {
        const customer = await Customer.findById(order.customer).lean().exec();
        const customerUser = await User.findById(customer.user).lean().exec();

        const employeeAssigned = await Employee.findById(order.employeeAssigned).lean().exec();

        const userAssigned = await User.findById(employeeAssigned.user).lean().exec();

        return { ...order, customer: customerUser.username, employeeAssigned: userAssigned.username };
    }))
    
    res.json(repairOrdersWithUers);
}

//@desc         Create new repairOrder
//@route        POST /repairorders
//@access       Private
const createNewRepairOrder = async (req, res) => {
    const { customer, employeeCreated, employeeAssigned, deviceType, serialNo, brand, issueDesc } = req.body;

    //confirm data
    if (!customer || !employeeCreated || !employeeAssigned || !deviceType || !serialNo || !brand || !issueDesc) {
        return res.status(400).json({ message: 'All fields are Required' });
    }

    //check for duplicate
    const duplicate = await RepairOrder.findOne({ serialNo }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate serial Number'});
    }

    //create and store the new order
    const repairOrder = await RepairOrder.create({ customer, employeeCreated, employeeAssigned, deviceType, serialNo, brand, issueDesc });

    if (repairOrder) {
        return res.status(201).json({ message: 'New repair order created' });
    } else {
        return res.status(400).json({ message: 'Invaid repair order recieved'})
    }
}

//@desc         Update repair order
//@route        PATCH /repairorders
//@access       Private
const updateRepairOrder = async (req, res) => {
    const { id, customer, employeeCreated, employeeAssigned, deviceType, serialNo, brand, issueDesc, completed } = req.body;

    //confirm data
    if (!id || !customer || !employeeCreated || !employeeAssigned || !deviceType || !serialNo || !brand || !issueDesc || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'all fields are Required'});
    }

    //confirm the note exist
    const repairOrder = await RepairOrder.findById(id).exec();

    if (!repairOrder) {
        return res.status(400).json({ message: 'Order not found' });
    }

    //check for duplicate serialNo
    const duplicate = await RepairOrder.findOne({ serialNo }).lean().exec();

    //allow renaming of the original order
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: `Dulicate order with serialNo ${serialNo}` });
    }

    //update repair order
    repairOrder.customer = customer;
    repairOrder.employeeCreated = employeeCreated;
    repairOrder.employeeAssigned = employeeAssigned;
    repairOrder.deviceType = deviceType;
    repairOrder.serialNo = serialNo;
    repairOrder.brand = brand;
    repairOrder.issueDesc = issueDesc;
    repairOrder.completed = completed;
    
    const updatedRepairOrder = await repairOrder.save();

    res.json(`Repair Order '${updatedRepairOrder._id}' updated`);
}

//@desc         Delete repair order
//@route        DELETE /repairorder
//@access       Private
const deleteRepairOrder = async (req, res) => {
    const { id } = req.body;

    //confirm data
    if (!id) {
        return res.status(400).json({ message: 'Repair Order ID Required'});
    }

    // confirm order exists to delete
    const repairOrder = await RepairOrder.findById(id).exec();

    if (!repairOrder) {
        return res.status(400).json({ message: 'Repair Order not found'});
    }

    //check if repair order has invoice
    const invoice = await Invoice.findOne({repairOrderId: id }).lean().exec();

    if (invoice) {
        await Invoice.findByIdAndDelete(invoice._id);
    }

    await repairOrder.deleteOne();

    const reply = `Repair Order with ID '${repairOrder._id}' deleted`;

    res.json(reply);
}

module.exports = {
    getAllRepairOrders,
    createNewRepairOrder,
    updateRepairOrder,
    deleteRepairOrder
}