const User = require('../models/User');
const RepairOrder = require('../models/RepairOrder');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const RepairRequest = require('../models/RepairRequest');
const bcrypt = require('bcrypt');

//@desc         Get all users
//@route        GET /users
//@access       Private
const getAllUsers = async (req, res) => {
    //get all users from mongoDB
    const users = await User.find().select('-password').lean();

    if (!users) return res.status(400).json({ message: 'No users found' });

    res.json(users);
}

//@desc         Create new user
//@route        POST /users
//@access       Private
const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body;
    
    //confirm data
    if (!username || !password) 
        return res.status(400).json({message: 'All fields are Required!'});

    //Check for duplicate user
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) return res.status(409).json({message: 'Duplicate username'});

    //hash password
    const hashedPwd = await bcrypt.hash(password, 10); //10 salt rounds

    //create user object
    const userObject = (!Array.isArray(roles) || !roles.length) ?
                    { username, "password": hashedPwd }
                    : { username, "password": hashedPwd, roles };

    //create and store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New user ${username} created` });
    } else {
        res.status(400).json({ message: 'Invalid user data recieved' })
    } 
}


//@desc         Update user
//@route        PATCH /users
//@access       Private
const updateUser = async (req, res) => {
    const { id, username, password, roles, active } = req.body;

    //confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All feilds except password are required'})
    }

    //check user if exist to update
    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    //check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2}).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username'});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        //hash password
        user.password = await bcrypt.hash(password, 10); //10 salt rounds
    }

    const updatedUser = await user.save();
 
    res.json({ message: `${ updatedUser.username } updated` });

}

//@desc         Delete user
//@route        DELETE /users
//@access       Private
const deleteUser = async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    //check if user exist to delete
    const user = await User.findById(id).exec();

    if (!user) 
        return res.status(400).json({ message: 'User does not exist'});

    //Does the user still have the assigned notes?
    const employee = await Employee.findOne({ user: id }).lean().exec();
    const customer = await Customer.findOne({ user: id }).lean().exec();
    

    // const userId = employee && employee._id;
    //     userId = customer && customer._id;

    let repairOrder;
    if(employee) 
        repairOrder = await RepairOrder.findOne({ employeeAssigned: employee._id }).lean().exec();
    if (customer)
        repairOrder = await RepairOrder.findOne({ customer: customer._id }).lean().exec();

    if (repairOrder) {
        return res.status(400).json({ message: 'user has assigned notes'})
    }

    if (employee)
        await Employee.findByIdAndDelete(employee._id);

    if (customer) {
        const repairRequest = await RepairRequest.findOne({ customer: customer._id });
        if (repairRequest) {
            await RepairRequest.findByIdAndDelete(repairRequest._id);
        }
        await Customer.findByIdAndDelete(customer._id);
    }
 
    await user.deleteOne();
 
    const reply = `Username ${user.username} with ID ${user._id} deleted`;
 
     res.json(reply);
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}