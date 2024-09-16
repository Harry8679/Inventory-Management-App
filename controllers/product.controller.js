const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const { fileSizeFormatter } = require('../utils/fileUpload.util');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_KEY_CLOUDINARY
});

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
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "ManagementInvent App", resource_type: "image" })
        } catch (err) {
            res.status(500);
            throw new Error('Image could not be uploaded');
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
    }

    // Create Product
    const product = await Product.create({ user: req.user.id, name, sku, category, quantity, price, description, image: fileData });

    res.status(201).json(product);
});

const getProducts = asyncHandler(async(req, res) => {
    const products = await Product.find({ user: req.user.id }).sort('-createdAttributes');
    res.status(200).json(products);
});

const getSingleProduct = asyncHandler(async(req, res) => {
    res.send('Get A Single Product');
});

module.exports = { createProduct, getProducts, getSingleProduct };