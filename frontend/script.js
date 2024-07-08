const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

function addMessage(content, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    messageElement.textContent = content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
        userInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from the server');
            }

            const data = await response.json();
            const botMessage = data.message;

            addMessage(botMessage);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was an error processing your request.');
        }
    }
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial bot message
addMessage('Welcome to our hotel booking service! How can I assist you today?');