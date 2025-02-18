// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware JSON
app.use(bodyParser.json());

// Connexion à PostgreSQL avec les informations du fichier .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Vérification de la connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Erreur de connexion à PostgreSQL:", err.message);
  } else {
    console.log("Connecté à la base de données PostgreSQL pour l'authentification");
  }
});

// Routes de l'application
const adresseRoutes = require('./routes/adresseRoutes');
const loginRouter = require('./routes/login');
const subscribeRoutes = require('./routes/subscribeRoutes');

app.use('/api', adresseRoutes);
app.use('/api', loginRouter);
app.use('/api', subscribeRoutes);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));

// Route principale
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

