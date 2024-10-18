const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Conversation } = require('./database');
const fetch = require('node-fetch');

console.log('Chatbot GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// Ensure the API key is properly loaded from environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in the environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchRoomOptions() {
  const response = await fetch('https://bot9assignement.deno.dev/rooms');
  return await response.json();
}

async function bookRoom(roomId, fullName, email, nights) {
  const response = await fetch('https://bot9assignement.deno.dev/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, fullName, email, nights }),
  });
  return await response.json();
}

async function getChatResponse(message) {
  await Conversation.create({ role: 'user', message });
  const chatHistory = await Conversation.findAll({
    order: [['createdAt', 'ASC']],
    limit: 10,
  });

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  try {
    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }],
      })),
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botMessage = response.text();

    // Rest of the function remains the same...
    // (Handle room options, booking, etc.)

    await Conversation.create({ role: 'assistant', message: botMessage });
    return botMessage;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    return "I'm sorry, but I encountered an error while processing your request. Please try again later.";
  }
}

module.exports = { getChatResponse };