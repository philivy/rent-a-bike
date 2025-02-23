const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://846a-88-180-120-69.ngrok-free.app'
}));

app.get('/api/rechercher', (req, res) => {
  res.json({ message: 'CORS is enabled for this route!' });
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
