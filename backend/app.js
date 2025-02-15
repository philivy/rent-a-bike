const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const loginRouter = require('./login'); // Importer le fichier login.js depuis le même dossier

const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Monter les routes de login.js sous /api
app.use('/api', loginRouter);

// Route pour servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
