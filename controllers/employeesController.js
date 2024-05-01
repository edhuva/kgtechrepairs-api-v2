const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//@desc         Get all employees
//@route        GET /employees
//@access       Private
const getAllEmployees = async (req, res) => {
    //get all employees from mongoDB
    const employees = await Employee.find().select('-password').lean();

    //if no employees
    if(!employees?.length) {
        return res.status(400).json({ message: 'No employee found'});
    }

    //Add username to each employee before sending the response
    const employeesWithUsers = await Promise.all(employees.map(async (employee) => {
        const user = await User.findById(employee.user).lean().exec();
        return {...employee, user: user.username, userid: user._id}
    }))

    res.json(employeesWithUsers);
}

//@desc         Create new employee
//@route        POST /employees
//access        Private
const createNewEmployee = async (req, res) => {
    const { username, fullname, email, phoneNo, password, roles, experties } = req.body;

    //confirm data
    if (!username || !fullname || !email || !phoneNo || !password) {
        return res.status(400).json({ messsage: 'All fields are Required!' });
    }

    //check for duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    //hash password
    const hashedPwd = await bcrypt.hash(password, 10); //10 salt rounds

   
    const userObject = (!Array.isArray(roles) || !roles.length)
                    ? { username, "password": hashedPwd }
                    : { username, "password": hashedPwd, roles};

    //create and store user
    const user = await User.create(userObject);

    if (!user) {
        return res.status(400).json({ message: 'Invalid employee data recieved' });
    }

    const employeeObject = (!Array.isArray(experties) || !experties.length)
                ? { user: user._id, fullname, phoneNo, email }
                : { user: user._id, fullname, phoneNo, email, experties };
    
    const employee = await Employee.create(employeeObject);

    if (employee) {
        res.status(201).json({ message: `New employee ${username} created`});
    } else {
        res.status(400).json({ message: 'Invalid employee data recieved' });
    }
}

//@desc         update employee
//@route        PATCH /employees
//@access       Private
const updateEmployee = async (req, res) => {
    const { employeeId, userId, username, fullname, email, phoneNo, password, roles, experties, active } = req.body;

    //confirm data
    if (!employeeId || !userId || !username || !fullname || !email || !phoneNo || !Array.isArray(roles) || !roles.length || !Array.isArray(experties) || !experties.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' });
    }

    //check if employee exist
    const employee = await Employee.findById(employeeId).exec();

    if (!employee) {
        return res.status(400).json({ message: 'employee not found'});
    }

    const user = await User.findById(userId).exec();

    if (!user) {
        return res.status(400).json({ message: 'employee not found'})
    }

    //check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2}).lean().exec();

    //allow updates to the original user
    if (duplicate && duplicate._id.toString() !== userId) {
        return res.status(409).json({ message: 'Duplicate username '});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        user.password = await bcrypt.hash(password, 10); //10 salt rounds
    }

    const updatedUser = await user.save();

    if (!updatedUser) {
        return res.status(400).json({ message: 'Invalid employee data recieved' });
    }

    employee.user = userId;
    employee.fullname = fullname;
    employee.phoneNo = phoneNo;
    employee.email = email;
    employee.experties = experties;

    await employee.save();

    res.json({ message: `${ updatedUser.username} updated`});
}

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee
}