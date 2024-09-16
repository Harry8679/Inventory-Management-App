const express = require('express');
const contactUs = require('../controllers/contact.controller');
const router = express.Router();

router.post('/', contactUs);

module.exports = router;