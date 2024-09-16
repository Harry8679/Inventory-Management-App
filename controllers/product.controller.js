const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const { fileSizeFormatter } = require('../utils/fileUpload.util');

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body;

    // Validation
    if (!name || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error('Please fill in all required fields')
    }

    // Handle Image Upload
    let fileData = {};
    if (req.file) {
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
    }

    // Create Product
    const product = await Product.create({ user: req.user.id, name, sku, category, quantity, price, description, image: fileData });

    res.status(201).json(product);
});

module.exports = { createProduct };