const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 🔹 Middleware pour parser le JSON (utile pour les requêtes API)
app.use(express.json());

// 🔹 Importation des routes API
const adresseRoutes = require('./routes/adresseRoutes');
const loginRouter = require('./routes/login');
const subscribeRoutes = require('./routes/subscribeRoutes');

// 🔹 Définir les routes API ici AVANT de servir le frontend
app.use('/api/adresse', adresseRoutes);
app.use('/api/login', loginRouter);
app.use('/api/subscribe', subscribeRoutes);

// 🔹 Servir les fichiers statiques depuis 'frontend/'
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔹 Route pour servir le fichier HTML principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 🔹 Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});

