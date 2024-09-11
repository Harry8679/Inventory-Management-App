const asyncHandler = require('express-async-handler');

const home = asyncHandler(async(req, res) => {
    res.send('Hello from Controller');
});

const register = asyncHandler(async(req, res) => {
    if (!req.body.email) {
        res.status(400);
        throw new Error('Please add an email address in the form register');
    }
    res.send('Register User');
});

module.exports = { home, register };