const express = require('express');
const { home } = require('../controllers/user.controller');
const router = express.Router();

router.get('/home', home);

module.exports = router;