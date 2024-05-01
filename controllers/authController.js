const User = require('../models/User');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//@desc Login
//@desc POST /auth
//@access Public
const login = async (req, res) => {
    const { username, password } = req.body;
 
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized'})
    }
    
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
        return res.status(401).json({ message: 'pwdUnauthorized'});
    }

    //create access token
    const accessToken = jwt.sign(
        {
            "userInfo": {
                "userid": foundUser._id,
                "username": foundUser.username,
                "roles": foundUser.roles,
                "authRistrictLevel": process.env.AUTH_HIGH_LEVEL,
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '2m'}
    )

    //create refresh Token 
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, // https
        sameSite: 'None', //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry; set to match RefreshToken
    })

    //send accessToken containing username and roles
    res.json({ accessToken })
}

//@desc         register new customer
//@route        POST /auth/register
//@access       Public - register new customer
const register = async (req, res) => {
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

//@desc         register new emplyee
//@route        POST /auth/empregister
//@access       Public - register new employee
const empRegister = async (req, res) => {
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

// @desc Refresh
// @desc Get /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.jwt) return res.status(401).json({ message: 'Unauthorized'});

    const refreshToken = cookie.jwt;

    //verify refresh Token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({
                message: 'Forbidden'
            });

            const foundUser = await User.findOne({ username: decoded.username }).exec();

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            //create access Token
            const accessToken = jwt.sign(
                {
                    "userInfo": {
                        "userid": foundUser._id,
                        "username": foundUser.username,
                        "roles": foundUser.roles,
                        "authRistrictLevel": process.env.AUTH_HIGH_LEVEL,
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '2m'}
            );

            res.json({ accessToken });
        }
    )
}

// @desc logout
// @desc POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.jwt) return res.sendStatus(204) // no content

    //clear Cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    res.json({ message: 'Cookie clearedxx' })
}

module.exports = {
    login, register, empRegister, refresh, logout
}
