const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Route pour récupérer les informations d'un client avec toutes ses adresses
router.get('/client/:id', async (req, res) => {
  try {
    const clientId = req.params.id;

    // Récupérer les informations de base du client
    const clientQuery = `
      SELECT id, nom, prenom
      FROM client
      WHERE id = $1
    `;
    const clientResult = await pool.query(clientQuery, [clientId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    const client = clientResult.rows[0];

    // Récupérer toutes les adresses associées au client
    const addressQuery = `
      SELECT rue, ville, code_postal, pays, telephone, type_adresse
      FROM adresse_contact
      WHERE client_id = $1
    `;
    const addressResult = await pool.query(addressQuery, [clientId]);

    const adresses = addressResult.rows.map(adresse => ({
      rue: adresse.rue || '',
      ville: adresse.ville || '',
      code_postal: adresse.code_postal || '',
      pays: adresse.pays || '',
      telephone: adresse.telephone || "Non défini",
      type_adresse: adresse.type_adresse // 0, 1, 2 selon votre système
    })).map(adresse => ({
      formatted: [adresse.rue, adresse.code_postal, adresse.ville, adresse.pays].filter(Boolean).join(', '),
      telephone: adresse.telephone,
      type_adresse: adresse.type_adresse
    }));

    res.json({
      id: client.id,
      nom: `${client.prenom} ${client.nom}`,
      adresses: adresses.length > 0 ? adresses : [{ formatted: "Non défini", telephone: "Non défini", type_adresse: null }]
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des infos client :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour récupérer les informations d'un magasin
router.get('/magasin/:id', async (req, res) => {
  try {
    const magasinId = req.params.id;
    const query = `
      SELECT m.nom, m.email, 
             ac.rue, ac.ville, ac.code_postal, ac.pays, ac.telephone
      FROM magasin_location m
      LEFT JOIN adresse_contact ac ON m.adresse_contact_id = ac.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [magasinId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Magasin non trouvé" });
    }

    const magasin = result.rows[0];
    const adresse = [
      magasin.rue,
      magasin.code_postal,
      magasin.ville,
      magasin.pays
    ].filter(Boolean).join(', ');

    res.json({
      nom: magasin.nom,
      email: magasin.email,
      adresse: adresse || "Non défini",
      telephone: magasin.telephone || "Non défini"
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des infos du magasin :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour récupérer toutes les infos des articles
router.post('/articles', async (req, res) => {
  const { articleIds } = req.body;

  if (!Array.isArray(articleIds) || articleIds.length === 0) {
    return res.status(400).json({ message: "Liste d'articles invalide" });
  }

  try {
    const query = `
      SELECT a.id, a.tarif_id, a.magasin_id, a.ref_magasin, a.designation, a.sexe, a.propulsion, 
             a.description, a.etat, a.disponible, a.photo, a.qrcode,
             t.prix_horaire, t.prix_demi_journee, t.prix_journee
      FROM article a
      JOIN tarif t ON a.tarif_id = t.id
      WHERE a.id = ANY($1::int[])
    `;
    const result = await pool.query(query, [articleIds]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucun article trouvé" });
    }

    const articles = result.rows.map(article => ({
      ...article,
      photo: article.photo instanceof Buffer ? article.photo.toString('base64') : null,
      qrcode: article.qrcode instanceof Buffer ? article.qrcode.toString('base64') : null
    }));

    res.json(articles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
