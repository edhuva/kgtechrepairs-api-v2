const Invoice = require('../models/Invoice');

//@desc         Get all invoices
//@route        GET /invoices
//@access       Private
const getAllInvoices = async (req, res) => {
    // Get all invoices from mongoDB
    const invoices = await Invoice.find().lean();

    //if no invoices
    if (!invoices?.length) {
        return res.status(400).json({ messaage: 'No invoices found' });
    }

    res.json(invoices);
}

//@desc         Create New Invoice
//@route        POST
//@access       Private
const createNewInvoice = async (req, res) => {
    const {repairOrderId, customer, employee, deviceType, serialNo, totalAmount } = req.body;

    //confirm data
    if (!repairOrderId || !customer || !employee || !deviceType || !serialNo || !totalAmount) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    //check for duplicate invoice
    const duplicate = await Invoice.findOne({ repairOrderId }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ messaage: 'Duplicate repair order invoice' });
    }

    //create and store the new invoice
    const invoice = await Invoice.create({ repairOrderId, customer, employee, deviceType, serialNo, totalAmount });

    if (invoice) {
        return res.status(201).json({ message: `New invoice with ID '${invoice._id} created` });
    } else {
        return res.status(400).json({ message: 'Invalid invoice data recieved' });
    }
}

//@desc         Update invoice
//@route        PATCH /invoices
//@access       Private
const updateInvoice = async (req, res) => {
    const { id, repairOrderId, customer, employee, deviceType, serialNo, totalAmount, paid } = req.body;

    //confirm data
    if (!id || !repairOrderId || !customer || !employee || !deviceType || !serialNo || !totalAmount || typeof paid !== 'boolean') {
        return res.status(400).json({ message: 'All fields are Required'});
    }

    //confirm invoice exist to update
    const invoice = await Invoice.findById(id).exec();

    if (!invoice) {
        return res.status(400).json({ message: 'Invoice not found' });
    }

    //check for duplicate invoice
    const duplicate = await Invoice.findOne({ repairOrderId }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate repair order invoice' });
    }

    //update invoice
    invoice.repairOrderId = repairOrderId;
    invoice.customer = customer;
    invoice.employee = employee;
    invoice.deviceType = deviceType;
    invoice.serialNo = serialNo;
    invoice.totalAmount = totalAmount;
    invoice.paid = paid;

    const updatedInvoice = await invoice.save();
    res.json(`'Invoice with ID ${updatedInvoice._id}' updated`);
}

//@desc         Delete invoice
//@route        DELETE /invoices
//@access       Private
const deleteInvoice = async (req, res) => {
    const { id } = req.body;

    //confirm data
    if (!id) {
        return res.status(400).json({ message: 'Invoice ID required'});
    }

    //confirm invoice exists to delete
    const invoice = await Invoice.findById(id).exec();

    if (!invoice) {
        return res.status(400).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();
    
    const reply = `Invoice with ID '${ invoice._id }' deleted`;

    res.json(reply);
}

module.exports = {
    getAllInvoices,
    createNewInvoice,
    updateInvoice,
    deleteInvoice
}