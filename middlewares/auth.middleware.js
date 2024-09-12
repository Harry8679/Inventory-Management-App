const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async(req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401);
            throw new Error('Not authorized, please login');
        }
    } catch (err) {}
});