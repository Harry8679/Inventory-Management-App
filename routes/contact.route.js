const express = require('express');
const contactUs = require('../controllers/contact.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/', protect, contactUs);

module.exports = router;