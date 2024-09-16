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
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(product);
});

const deleteProduct = asyncHandler(async(req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product removed successfuly !' });
});

const updateProduct = asyncHandler(async (req, res) => {
    const { name, category, quantity, price, description } = req.body;
    const { id } = req.params;

    // Vérifiez si le produit existe
    const product = await Product.findById(id);

    console.log('Données de la requête :', req.body);
    console.log('Produit avant mise à jour :', product);

    console.log('User ID:', req.user.id);
    console.log('Product User ID:', product.user.toString());

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Vérifiez si l'utilisateur est autorisé à mettre à jour ce produit
    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    if (req.file) {
        try {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "ManagementInvent App",
                resource_type: "image"
            });
    
            fileData = {
                fileName: req.file.originalname,
                filePath: uploadedFile.secure_url,
                fileType: req.file.mimetype,
                fileSize: fileSizeFormatter(req.file.size, 2),
            };
            updatedFields.image = fileData; // Mettez à jour l'image uniquement si une nouvelle est uploadée

            product.name = name || product.name;
            product.category = category || product.category;
            product.quantity = quantity || product.quantity;
            product.price = price || product.price;
            product.description = description || product.description;
            product.image = fileData;

            // Sauvegarde manuelle des modifications
            const updatedProduct = await product.save();
            console.log('Produit mis à jour avec save():', updatedProduct);
            res.status(200).json(updatedProduct);
        } catch (err) {
            res.status(500);
            throw new Error('Image could not be uploaded');
        }
    }
});


// const updateProduct = asyncHandler(async (req, res) => {
//     const { name, category, quantity, price, description } = req.body;
//     const { id } = req.params;

//     const product = await Product.findById(id);

//     if (!product) {
//         res.status(404);
//         throw new Error('Product not found');
//     }

//     // Match product to its user
//     if (product.user.toString() !== req.user.id) {
//         res.status(401);
//         throw new Error('User not authorized');
//     }

//     // Handle Image Upload
//     let fileData = {};
//     if (req.file) {
//         let uploadedFile;
//         try {
//             uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "ManagementInvent App", resource_type: "image" })
//         } catch (err) {
//             res.status(500);
//             throw new Error('Image could not be uploaded');
//         }
//         fileData = {
//             fileName: req.file.originalname,
//             filePath: uploadedFile.secure_url,
//             fileType: req.file.mimetype,
//             fileSize: fileSizeFormatter(req.file.size, 2),
//         }
//     }

//     // Update Product
//     const updatedProduct = await Product.save({ _id: id }, { name, category, quantity, price, description, 
//         image: Object.keys(fileData).length === 0 ? product?.image : fileData }, { new: true, runValidators: true });

//     res.status(200).json(updatedProduct);
// });

module.exports = { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct };