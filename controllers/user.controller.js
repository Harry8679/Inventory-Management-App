const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');

const home = asyncHandler(async(req, res) => {
    res.send('Hello from Controller');
});

const register = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be up to 6 characters');
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Email has already been registered');
    }
    
});

module.exports = { home, register };