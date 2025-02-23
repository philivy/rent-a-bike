// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Importez le module cors
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8080; // 🚀 Uniformisation du port

// Middleware JSON
app.use(bodyParser.json());

// Middleware pour ajouter Access-Control-Allow-Private-Network
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// Configuration CORS
app.use(cors({
  origin: 'https://846a-88-180-120-69.ngrok-free.app', // Autoriser uniquement cette origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  credentials: true, // Autoriser les cookies si nécessaire
  preflightContinue: true
}));

// Middleware pour gérer les requêtes OPTIONS (pré-vérification CORS)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://846a-88-180-120-69.ngrok-free.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Private-Network', 'true'); // Ajouter cette ligne
  res.sendStatus(204); // Répondre avec un statut 204 (No Content)
});

// Connexion à PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Vérification de la connexion à PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ Erreur de connexion à PostgreSQL:", err.message);
  } else {
    console.log("✅ Connecté à PostgreSQL pour l'authentification");
  }
});

// 🔹 Routes API (avant les fichiers statiques)
const adresseRoutes = require('./routes/adresseRoutes');
console.log("🔍 adresseRoutes:", adresseRoutes);

const loginRouter = require('./routes/login');
console.log("🔍 loginRouter:", loginRouter);

const subscribeRoutes = require('./routes/subscribeRoutes');
console.log("🔍 subscribeRoutes:", subscribeRoutes);

const dispoRoutes = require('./routes/dispoRoutes');
console.log("🔍 dispoRoutes:", dispoRoutes);

app.use('/api', adresseRoutes);
app.use('/api', loginRouter);
app.use('/api', subscribeRoutes);
app.use('/api', dispoRoutes);

// 🔹 Servir les fichiers statiques après les routes API
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Route principale (éviter de bloquer les routes API)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend', 'index.html');

  // Vérifier si index.html existe pour éviter des erreurs 404
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('❌ Fichier index.html introuvable');
  }
});

// 🔹 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

