require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

// Middleware pour ajouter Access-Control-Allow-Private-Network
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:8080', 'https://efb8-88-180-120-69.ngrok-free.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
    console.log("✅ Connecté à PostgreSQL");
  }
});

// Importer les routes
const adresseRoutes = require('./routes/adresseRoutes');
const loginRouter = require('./routes/login');
const subscribeRoutes = require('./routes/subscribeRoutes');
const dispoRoutes = require('./routes/dispoRoutes');
const factureRoutes = require('./routes/factureRoutes');

// Monter les routes directement sous /api
app.use('/api/adresse', adresseRoutes);
app.use('/api/login', loginRouter);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/dispo', dispoRoutes);    
app.use('/api/facture', factureRoutes);

////////////////////////////////////////////////////////////////
// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir le dossier scripts
app.use('/scripts', express.static(path.join(__dirname, '../frontend/scripts'), {
  setHeaders: (res, path) => {
    console.log(`Serveur envoie le fichier: ${path}`); // Log pour vérifier la demande
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Route catch-all
app.get('*', (req, res) => {
 console.log(`Catch-all déclenché pour: ${req.url}`);
  const indexPath = path.join(__dirname, '../frontend', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('❌ Fichier index.html introuvable');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
