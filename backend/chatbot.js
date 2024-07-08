const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Conversation } = require('./database');
const fetch = require('node-fetch'); // Import fetch





console.log('Chatbot GEMINI_API_KEY:', process.env.GEMINI_API_KEY);



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchRoomOptions() {
    const response = await fetch('https://bot9assignement.deno.dev/rooms');
    return await response.json();
}

async function bookRoom(roomId, fullName, email, nights) {
    const response = await fetch('https://bot9assignement.deno.dev/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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

    // Check if the bot is asking for room options
    if (botMessage.toLowerCase().includes("available rooms") || botMessage.toLowerCase().includes("room options")) {
        const rooms = await fetchRoomOptions();
        const roomInfo = rooms.map(room => `Room $
        {room.id}: ${room.name} - $${room.price} per night`).join('\n');
        const fullResponse = botMessage + '\n\n' + roomInfo;
        await Conversation.create({ role: 'assistant', message: fullResponse });
        return fullResponse;
    }

    // Check if the bot is trying to book a room
    if (botMessage.toLowerCase().includes("book the room")) {
        // Extract booking details (this is a simplified version, you might need more robust parsing)
        const roomId = parseInt(botMessage.match(/room (\d+)/i)?.[1]);
        const fullName = botMessage.match(/name: ([^\n]+)/i)?.[1];
        const email = botMessage.match(/email: ([^\n]+)/i)?.[1];
        const nights = parseInt(botMessage.match(/(\d+) nights/i)?.[1]);

        if (roomId && fullName && email && nights) {
            try {
                const booking = await bookRoom(roomId, fullName, email, nights);
                const confirmationMessage = `Great! I've booked Room ${roomId} for ${fullName} (${email}) for ${nights} nights. Your booking ID is ${booking.id}.`;
                await Conversation.create({ role: 'assistant', message: confirmationMessage });
                return confirmationMessage;
            } catch (error) {
                console.error('Booking error:', error);
                return "I'm sorry, there was an error while trying to book the room. Please try again.";
            }
        }
    }

    await Conversation.create({ role: 'assistant', message: botMessage });
    return botMessage;
}

module.exports = { getChatResponse };