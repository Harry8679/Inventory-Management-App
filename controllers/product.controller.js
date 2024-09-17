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
    const { id } = req.params;
    const { name, sku, category, quantity, price, description } = req.body;

    // Vérifiez si le produit existe
    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Vérifiez si l'utilisateur est autorisé à modifier ce produit
    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Gestion de l'upload de la nouvelle image si elle est présente
    let fileData = product.image; // Conserver l'image actuelle si aucune nouvelle image n'est uploadée
    if (req.file) {
        // Supprimer l'ancienne image de Cloudinary avant d'en uploader une nouvelle
        if (product.image && product.image.filePath) {
            const publicId = product.image.filePath.split('/').pop().split('.')[0]; // Extraire l'ID public de Cloudinary
            await cloudinary.uploader.destroy(publicId); // Supprimer l'image de Cloudinary
        }

        try {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "ManagementInvent App",
                resource_type: "image",
            });

            fileData = {
                fileName: req.file.originalname,
                filePath: uploadedFile.secure_url,
                fileType: req.file.mimetype,
                fileSize: fileSizeFormatter(req.file.size, 2),
            };
        } catch (err) {
            res.status(500);
            throw new Error('Image could not be uploaded');
        }
    }

    // Mise à jour des champs modifiés uniquement
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
            name: name || product.name,
            sku: sku || product.sku,
            category: category || product.category,
            quantity: quantity || product.quantity,
            price: price || product.price,
            description: description || product.description,
            image: fileData // Mettre à jour l'image si elle a changé
        },
        { new: true, runValidators: true } // `new: true` pour renvoyer le produit mis à jour
    );

    res.status(200).json(updatedProduct);
});


// const updateProduct = asyncHandler(async (req, res) => {
//     const { id } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête
//     const { name, category, quantity, price, description } = req.body; // Récupérer les données du corps de la requête

//     // Vérifier si le produit existe
//     const product = await Product.findById(id);
//     if (!product) {
//         res.status(404);
//         throw new Error('Product not found');
//     }

//     // Vérifier si l'utilisateur est autorisé à mettre à jour ce produit
//     if (product.user.toString() !== req.user.id) {
//         res.status(401);
//         throw new Error('User not authorized');
//     }

//     // Gestion de l'upload de la nouvelle image si elle est présente
//     let fileData = product.image; // Conserver l'image actuelle si aucune nouvelle image n'est uploadée
//     if (req.file) {
//         // Supprimer l'ancienne image de Cloudinary avant d'en uploader une nouvelle
//         if (product.image && product.image.filePath) {
//             const publicId = product.image.filePath.split('/').pop().split('.')[0]; // Extraire l'ID public de Cloudinary
//             await cloudinary.uploader.destroy(publicId); // Supprimer l'image de Cloudinary
//         }

//         try {
//             const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
//                 folder: "ManagementInvent App",
//                 resource_type: "image",
//             });

//             fileData = {
//                 fileName: req.file.originalname,
//                 filePath: uploadedFile.secure_url,
//                 fileType: req.file.mimetype,
//                 fileSize: fileSizeFormatter(req.file.size, 2),
//             };
//         } catch (err) {
//             res.status(500);
//             throw new Error('Image could not be uploaded');
//         }
//     }

//     // Mise à jour du produit avec les nouveaux champs (ou anciens si non modifiés)
//     product.name = name || product.name;
//     product.category = category || product.category;
//     product.quantity = quantity || product.quantity;
//     product.price = price || product.price;
//     product.description = description || product.description;
//     product.image = fileData; // Mettre à jour l'image

//     // Sauvegarder les modifications
//     const updatedProduct = await product.save();

//     res.status(200).json(updatedProduct);
// });



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