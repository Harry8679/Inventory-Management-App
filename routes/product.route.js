const express = require('express');
const { createProduct, getProducts } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/fileUpload.util');
const router = express.Router();

router.post('/', protect, upload.single('image'), createProduct);
router.get('/', protect, getProducts);

module.exports = router;