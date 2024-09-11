const express = require('express');
const { home } = require('../controllers/user.controller');
const router = express.Router();

router.get('/home', home);
router.post('/register');

module.exports = router;