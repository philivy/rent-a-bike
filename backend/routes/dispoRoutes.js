require('dotenv').config(); // Charge les variables d'environnement

const express = require('express');
const router = express.Router(); // ✅ Déclaration correcte du router
const { Pool } = require('pg');

// Connexion à PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ✅ Route pour rechercher les articles disponibles
router.post('/rechercher', async (req, res) => {
  const { start_date, start_time, end_date, end_time } = req.body;

  console.log("📌 Données reçues :", { start_date, start_time, end_date, end_time });
  if (!start_date || !start_time || !end_date || !end_time) {
    return res.status(400).json({ message: "Toutes les informations de date et heure sont requises." });
  }

  try {
    const startDateTime = `${start_date} ${start_time}:00`;
    const endDateTime = `${end_date} ${end_time}:00`;

    const query = `
      SELECT 
          a.id, 
          a.ref_magasin, 
          a.designation, 
          a.description, 
          a.etat, 
          a.photo, 
          a.qrcode,
          a.sexe, 
          a.propulsion,
          t.prix_horaire, 
          t.prix_demi_journee, 
          t.prix_journee
      FROM article a
      JOIN tarif t ON a.tarif_id = t.id
      WHERE a.disponible = TRUE
      AND NOT EXISTS (
          SELECT 1
          FROM reservation r
          WHERE r.article_id = a.id
          AND (r.start_date, r.end_date) OVERLAPS ($1::timestamp, $2::timestamp)
          AND r.status = 'En cours'
      )
    `;

    console.log("📋 Requête SQL exécutée :", query); // Affiche la requête SQL
    console.log("📅 Paramètres de la requête :", [startDateTime, endDateTime]); // Affiche les paramètres

    const result = await pool.query(query, [startDateTime, endDateTime]);

    console.log("📊 Données extraites de la base de données :", result.rows); // Affiche les données brutes

    if (result.rows.length > 0) {
      const articles = result.rows.map(article => {
        return {
          ...article,
          // Vérification et conversion correcte des images en base64
          photo: article.photo instanceof Buffer ? article.photo.toString('base64') : null,
          qrcode: article.qrcode instanceof Buffer ? article.qrcode.toString('base64') : null
        };
      });

      console.log("🖼️ Articles après transformation :", articles); // Affiche les articles transformés

      res.json(articles);
    } else {
      console.log("🔍 Aucun article trouvé pour les dates spécifiées."); // Affiche un message si aucun article n'est trouvé
      res.status(404).json({ message: 'Rien de disponible pour ces dates.' });
    }
  } catch (error) {
    console.error("❌ Erreur SQL lors de la recherche d'articles :", error.message);
    res.status(500).json({ message: 'Erreur lors de la recherche d\'articles.' });
  }
});

// Ne pas oublier
module.exports = router; // ✅ Export correct
