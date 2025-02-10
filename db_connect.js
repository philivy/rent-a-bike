const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./db/bikes.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Exemple de requête pour tester la connexion
db.serialize(() => {
  db.each('SELECT rowid AS id, name FROM customers', (err, row) => {
    if (err) {
      console.error('Error running query:', err.message);
    } else {
      console.log(row.id + ': ' + row.name);
    }
  });
});

// N'oubliez pas de fermer la base de données lorsque vous avez terminé
// db.close();
