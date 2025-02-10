const express = require('express');
const bodyParser = require('body-parser');
const loginRoutes = require('./login'); // Import du fichier login.js

const app = express();
const port = 3000;

// Middlewares pour gérer les requêtes JSON et URL-encoded
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes de login
app.use(loginRoutes);

// Servir le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur fonctionne sur http://localhost:${port}`);
});
