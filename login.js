const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const router = express.Router();

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./db/bikes.db', (err) => {
  if (err) {
    console.error("Erreur lors de l'ouverture de la base de données:", err.message);
  } else {
    console.log("Connecté à la base de données SQLite pour l'authentification");
  }
});

// Route de connexion
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Erreur : Email et mot de passe requis");
    return res.status(400).send("Email et mot de passe requis !");
  }

  console.log(`Tentative de connexion : Email=${email}`);

  // Vérifier si l'utilisateur existe
  const query = "SELECT * FROM customers WHERE email = ?";
  
  db.get(query, [email], (err, user) => {
    if (err) {
      console.error("Erreur SQL:", err.message);
      return res.status(500).send("Erreur interne du serveur");
    }

    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(401).send("Identifiants incorrects");
    }

    // Vérifier le mot de passe (Assurez-vous que les mots de passe sont hashés dans la base)
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error("Erreur de vérification du mot de passe:", err.message);
        return res.status(500).send("Erreur lors de la vérification du mot de passe");
      }

      if (result) {
        console.log("Connexion réussie !");
        return res.send("Connexion réussie !");
      } else {
        console.log("Mot de passe incorrect");
        return res.status(401).send("Identifiants incorrects");
      }
    });
  });
});

module.exports = router;
