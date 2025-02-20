const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const loginRouter = require('./login'); // Importer le fichier login.js depuis le même dossier

const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Monter les routes de login.js
app.use('/api', loginRouter);

app.post('/inscription', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email requis" });
    }
    // Simuler une inscription réussie
    res.json({ success: true, message: "Inscription réussie !" });
});


// Définir la route pour /api/adresse_contact
app.post('/api/adresse_contact', (req, res) => {
  const { client_id, rue, etage, residence, ville, code_postal, pays, telephone, type_adresse } = req.body;

  // Validation des champs obligatoires
  if (!client_id || !rue || !ville || !code_postal || !pays || !telephone || !type_adresse) {
    return res.status(400).json({ success: false, error: "Tous les champs sont obligatoires" });
  }

  // Simuler l'ajout de l'adresse de contact
  res.json({ success: true, message: "Adresse de contact ajoutée avec succès !" });
});



// Route pour servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Démarrer le serveur
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

