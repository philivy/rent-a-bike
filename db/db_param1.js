// Configuration de la connexion à PostgreSQL
// db_param.js
require('dotenv').config();  // Charger les variables d'environnement

module.exports = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Mot de passe stocké en clair dans .env
  port: process.env.DB_PORT,
};


