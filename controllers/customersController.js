const Customer = require('../models/Customer');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//@desc         Get all customers
//@route        GET /customers
//@access       Private
const getAllCustomers = async (req, res) => {
    //get all customers from mongoDB
    const customers = await Customer.find().select('-password').lean();

    //if no customer
    if(!customers?.length) {
        return res.status(400).json({ message: 'No customer found'})
    }

    //Add username to each customer before sending the response
    const customersWithUsers = await Promise.all(customers.map(async (customer) => {
        const user = await User.findById(customer.user).lean().exec()
        return { ...customer, user: user.username, userid: user._id};
    }))  

    res.json(customersWithUsers);
}

//@desc         Create new customer
//@route        POST /customers
//@access       Private
const createNewCustomer = async (req, res) => {
    const { username, fullname, email, phoneNo, password, roles } = req.body;

    //confirm data
    if (!username || !fullname || !email || !phoneNo || !password) {
        return res.status(400).json({ message: 'All fields are Required!' });
    }

    //check for duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username '});
    }

    //hash password
    const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
                    ? { username, "password": hashedPwd }
                    : { username, "password": hashedPwd, roles};
    
    //create and store user
    const user = await User.create(userObject);

    if (!user) {
        return res.status(400).json({ message: 'Invalid customer data recieved'});
    }

    const customerObject = { "user": user._id, fullname, phoneNo, email };

    const customer = await Customer.create(customerObject);

    if (customer) {
        res.status(201).json({ message: `New customer ${username} created` });
    } else {
        res.status(400).json({ message: 'Invalid customer data recieved'});
    }
}

//@desc         Update customer
//@route        PATCH /customer
//@access       Private
const updateCustomer = async (req, res) => {
    const { customerId, userId, username, fullname, email, phoneNo, password, roles, active } = req.body;

    //confirm data
    if (!customerId || !userId || !username || !fullname || !email || !phoneNo || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required'});
    }

    //check if customer exist 
    const customer = await Customer.findById(customerId).exec();

    if (!customer) {
        return res.status(400).json({ message: 'customer not found'});
    }

    const user = await User.findById(userId).exec();

    if (!user) {
        return res.status(400).json({ message: 'customer not found'})
    }

    //check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    //allow updates to the original user 
    if (duplicate && duplicate._id.toString() !== userId) {
        return res.status(409).json({ message: 'Duplicate username'});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        user.password = await bcrypt.hash(password, 10); //10 salt rounds
    }

    const updatedUser = await user.save();

    if (!updatedUser) {
        return res.status(400).json({ message: 'Invalid customer data recieved'})
    }

    customer.user = userId;
    customer.fullname = fullname;
    customer.phoneNo = phoneNo;
    customer.email = email;

    await customer.save();

    res.json({ message: `${ updatedUser.username} updated`});
}

module.exports = {
    getAllCustomers,
    createNewCustomer,
    updateCustomer
}