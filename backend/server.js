import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { initializeGenerativeAI, getChatResponse } from './chatbot.js';
import { sequelize } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3456;

// Logging
console.log('PORT:', PORT);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

initializeGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

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

// */