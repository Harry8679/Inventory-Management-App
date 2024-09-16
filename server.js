const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
dotenv.config();

const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.route');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 4500;

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);

// Connexion à la base de données
connectDB();

// Error Middlewares
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});
