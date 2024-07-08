require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { getChatResponse } = require('./chatbot');
const { sequelize } = require('./database');

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Logging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await getChatResponse(message);
    res.json({ message: response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Unable to sync database:', error);
});