require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const express = require('express');
const router = express.Router();
const { Pool } = require('pg'); // Import de pg

// Utilisation des variables d'environnement pour la connexion à la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Route pour ajouter une adresse
router.post('/adresse_contact', async (req, res) => {
  try {
    console.log("📬 Contenu de la requête :", req.body);

    const { client_id, rue, etage, residence, ville, code_postal, pays, telephone, type_adresse } = req.body;

    if (!client_id || !rue || !ville || !code_postal || !pays || !telephone || !type_adresse) {
      return res.status(400).json({ success: false, error: "Tous les champs requis doivent être remplis." });
    }

    const query = `
      INSERT INTO adresse_contact 
        (client_id, rue, etage, residence, ville, code_postal, pays, telephone, type_adresse)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;

    const result = await pool.query(query, [client_id, rue, etage, residence, ville, code_postal, pays, telephone, type_adresse]);

    return res.status(201).json({ success: true, adresse: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'adresse :", error.message);
    return res.status(500).json({ success: false, error: "Erreur lors de l'ajout de l'adresse" });
  }
});

// Route pour lire toutes les adresses de contact
router.get('/adresse_contact/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    const query = `SELECT * FROM adresse_contact WHERE client_id = $1`;

    const result = await pool.query(query, [client_id]);

    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, adresses: result.rows });
    } else {
      return res.status(404).json({ success: false, error: "Aucune adresse trouvée pour ce client." });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des adresses :", error.message);
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des adresses" });
  }
});

// Route pour mettre à jour une adresse existante
router.put('/adresse_contact/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rue, etage, residence, ville, code_postal, pays, telephone, type_adresse } = req.body;

    const addressCheck = await pool.query(
      `SELECT * FROM adresse_contact WHERE id = $1`,
      [id]
    );

    if (addressCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Adresse introuvable." });
    }

    const query = `
      UPDATE adresse_contact 
      SET rue=$1, etage=$2, residence=$3, ville=$4, code_postal=$5, pays=$6, telephone=$7, type_adresse=$8 
      WHERE id=$9 
      RETURNING *`;

    const result = await pool.query(query, [rue, etage, residence, ville, code_postal, pays, telephone, type_adresse, id]);

    return res.status(200).json({ success: true, adresse: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur mise à jour adresse :", error.message);
    return res.status(500).json({ success: false, error: "Erreur mise à jour" });
  }
});

module.exports = router;

