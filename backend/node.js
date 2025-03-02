const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://d383-88-180-120-69.ngrok-free.app/';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/api/rechercher', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    res.json({ 
      message: 'CORS is enabled for this route!',
      searchQuery: query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${ALLOWED_ORIGIN}`);
});
