const express = require('express');
const { createProduct } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/fileUpload.util');
const router = express.Router();

router.post('/', protect, upload.single('image'), createProduct);

module.exports = router;