const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

function addMessage(content, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.message) {
                throw new Error('Unexpected response format');
            }

            addMessage(data.message);
        } catch (error) {
            console.error('Error:', error.message);
            addMessage('Sorry, there was an error processing your request. Please try again.');
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