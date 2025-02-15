const express = require('express');
const { Pool } = require('pg'); // Utilisation du module pg pour PostgreSQL
const bcrypt = require('bcryptjs');

const router = express.Router();




// Configuration de la connexion à PostgreSQL
const pool = new Pool({
  user: 'yoshi', // Remplacez par votre utilisateur PostgreSQL
  host: 'localhost',         // Hôte de la base de données
  database: 'location_db',   // Nom de la base de données
  password: '6cobalt9', // Remplacez par votre mot de passe PostgreSQL
  port: 5432,                // Port par défaut de PostgreSQL
});

// Vérification de la connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Erreur lors de la connexion à PostgreSQL:", err.message);
  } else {
    console.log("Connecté à la base de données PostgreSQL pour l'authentification");
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
  const query = "SELECT * FROM client WHERE email = $1";
  
  pool.query(query, [email], (err, result) => {
    if (err) {
      console.error("Erreur SQL:", err.message);
      return res.status(500).send("Erreur interne du serveur");
    }

    const user = result.rows[0]; // Récupérer le premier utilisateur trouvé

    if (!user) {
      console.log("Email inconnu");
      return res.status(401).json({ error: "Email inconnu" });
    }

    // Vérifier le mot de passe
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
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }
    });
  });
});

// Route d'inscription
router.post('/inscription', async (req, res) => {
  console.log("Route /inscription atteinte"); // Vérification si la route est bien atteinte
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Erreur : Email et mot de passe requis");
    return res.status(400).send("Email et mot de passe requis !");
  }

  try {
    // Vérifier si l'email existe déjà
    const checkEmailQuery = 'SELECT * FROM client WHERE email = $1';
    const emailExists = await pool.query(checkEmailQuery, [email]);

    if (emailExists.rows.length > 0) {
      console.log("Email déjà utilisé");
      return res.status(400).json({ success: false, error: "Cet email est déjà utilisé." });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer le nouvel utilisateur
    const insertQuery = 'INSERT INTO client (email, password) VALUES ($1, $2) RETURNING *';
    const newUser = await pool.query(insertQuery, [email, hashedPassword]);

    console.log("Inscription réussie :", newUser.rows[0]);
    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error.message);
    res.status(500).json({ success: false, error: "Erreur lors de l'inscription." });
  }
});

module.exports = router;
