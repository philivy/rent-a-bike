const express = require('express');
const router = express.Router();  // Initialisation du routeur Express

require('dotenv').config();  // Charge les variables depuis le fichier .env

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const bcrypt = require('bcryptjs');  // Utilisation de bcryptjs pour le hachage du mot de passe

router.post('/subscribe', async (req, res) => {
  try {
    const { email, password, nom, prenom, magasin_id } = req.body;

    // Vérifier si l'email, le mot de passe, le nom et le prénom sont fournis
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: "Email, mot de passe, nom et prénom sont requis !" });
    }

    // Vérifier si l'email est déjà utilisé
    const checkUserQuery = "SELECT * FROM client WHERE email = $1";
    const result = await pool.query(checkUserQuery, [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "L'email est déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inscrire le nouvel utilisateur dans la base de données avec nom, prénom et magasin_id
    const insertQuery = "INSERT INTO client (email, password, nom, prenom, magasin_id) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    const insertResult = await pool.query(insertQuery, [email, hashedPassword, nom, prenom, magasin_id]);

    if (insertResult.rows.length > 0) {
      return res.json({ success: true, client_id: insertResult.rows[0].id });
    } else {
      return res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  } catch (error) {
    // Capturer les erreurs serveur
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Exporter le routeur pour l'utiliser dans app.js
module.exports = router;

