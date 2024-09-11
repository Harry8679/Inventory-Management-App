const asyncHandler = require('express-async-handler');

const home = asyncHandler(async(req, res) => {
    res.send('Hello from Controller');
});

const register = asyncHandler(async(req, res) => {
    res.send('Hello from Controller');
});

module.exports = { home, register };