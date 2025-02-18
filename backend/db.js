////////////////// db.js
// Configuration de la connexion à PostgreSQL
///////////////////////////////////////////////////////////////////////////////
const { Pool } = require('pg');  // Utilisation de la bibliothèque pg

const pool = new Pool({
  user: 'yoshi', // Remplacez par votre utilisateur PostgreSQL
  host: 'localhost',         // Hôte de la base de données
  database: 'location_db',   // Nom de la base de données
  password: '6yoshi9', // Remplacez par votre mot de passe PostgreSQL
  port: 5432,                // Port par défaut de PostgreSQL
});

module.exports = pool;

