 require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const validator = require('validator'); // Ajout de la validation de l'email

// Créer une instance du routeur
const router = express.Router();

// Configuration de la connexion à PostgreSQL via les variables d'environnement
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/////////////////////////////////////////////////////////////////////////////
// Vérification de la connexion à la base de données
///////////////////////////////////////////////////////////////////////////

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Erreur de connexion à PostgreSQL:", err.message);
  } else {
    console.log("Connecté à la base de données PostgreSQL pour l'authentification");
  }
});

//////////////////////////////////////////
// Route de connexion

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérification de la validité de l'email et du mot de passe
  if (!email || !password) {
    console.log("❌ Erreur : Email et mot de passe requis");
    return res.status(400).json({ error: "Email et mot de passe requis !" });
  }

  // Vérifier que l'email a un format valide
  if (!validator.isEmail(email)) {
    console.log("❌ Erreur : Format d'email invalide");
    return res.status(400).json({ error: "Format d'email invalide" });
  }

  console.log(`🔍 Tentative de connexion : Email=${email}`);

  try {
    console.log("🛠 Exécution de la requête pour récupérer l'utilisateur...");
    const query = "SELECT * FROM client WHERE email = $1";
    const result = await pool.query(query, [email]);

    console.log("📌 Résultat de la requête utilisateur :", result.rows);

    if (result.rows.length === 0) {
      console.log("❌ Email inconnu");
      return res.status(401).json({ error: "Email inconnu" });
    }

    const user = result.rows[0];

    console.log("🔑 Vérification du mot de passe...");
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    console.log("✅ Connexion réussie, mot de passe ok !");

    // Vérification correcte de l'existence de l'adresse
    console.log(`📍 Vérification de l'adresse pour client_id=${user.id}...`);
    
    try {
      const adresseResult = await pool.query(
        "SELECT COUNT(*) AS total FROM adresse_contact WHERE client_id = $1",
        [user.id]
      );

      console.log("📌 Résultat de la requête adresse :", adresseResult.rows);

      if (!adresseResult.rows || adresseResult.rows.length === 0) {
        console.error("❌ ERREUR SQL : La requête n'a retourné aucun résultat.");
        return res.status(500).json({ error: "Problème avec la requête d'adresse." });
      }

      const adresseCount = parseInt(adresseResult.rows[0].total, 10);
      console.log(`🏠 Nombre d'adresses trouvées : ${adresseCount}`);

      if (adresseCount === 0) {
        return res.json({ error: "Adresse de contact manquante", client_id: user.id });
      }

      return res.json({ success: true, message: "Connexion réussie, adresse trouvée !", client_id: user.id });
      
    } catch (err) {
      console.error("❌ ERREUR lors de l'exécution de la requête d'adresse :", err.message);
      return res.status(500).json({ error: "Erreur lors de la vérification de l'adresse." });
    }
  } catch (err) {
    console.error("🔥 Erreur lors de la connexion :", err);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;

