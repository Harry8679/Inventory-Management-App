const express = require('express');
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/fileUpload.util');
const router = express.Router();

router.post('/', protect, upload.single('image'), createProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, getSingleProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id', protect, updateProduct);

module.exports = router;