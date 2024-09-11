const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
dotenv.config();

const userRoutes = require('./routes/user.route');

const app = express();

const PORT = process.env.PORT || 4500;

app.use('/api/v1/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello from the API');
});

// Connexion à la base de données
connectDB();

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});
