const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 4500;

// Connexion à la base de données
connectDB();

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});
