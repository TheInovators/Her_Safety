// DOM Elements
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendButton = document.getElementById('send-message');

// Constants
const API_KEY = "AIzaSyAX8aV6S4Bf9CcAkYuvAwZiYmL00OoUN8c";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
// State management
const chatState = {
    isProcessing: false,
    messageHistory: []
};

// Create message element with dynamic classes
const createMessageElement = (content, type) => {
    const div = document.createElement("div");
    div.classList.add("message", `${type}-message`);
    
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-text");
    messageContent.innerHTML = content;
    
    const timestamp = document.createElement("div");
    timestamp.classList.add("message-timestamp");
    timestamp.textContent = new Date().toLocaleTimeString();
    
    div.appendChild(messageContent);
    div.appendChild(timestamp);
    
    return div;
};

// Generate bot response
const generateBotResponse = async (userMessage) => {
    const requestOptions = {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userMessage }]
            }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to get response');
        }

        // Extract the bot's response text from the API response
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "I apologize, but I couldn't generate a response.";
        
        return botResponse;
    } catch (error) {
        console.error('Error generating response:', error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

// Handle outgoing chat message
const handleOutgoingMessage = async (userMessage) => {
    if (!userMessage || chatState.isProcessing) return;
    
    chatState.isProcessing = true;
    
    // Clear input and disable it temporarily
    messageInput.value = "";
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    try {
        // Add user message to chat
        const userMessageElement = createMessageElement(userMessage, "user");
        chatBody.appendChild(userMessageElement);
        
        // Add typing indicator
        const typingIndicator = createMessageElement("Bot is typing...", "bot");
        typingIndicator.classList.add("typing-indicator");
        chatBody.appendChild(typingIndicator);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Generate and display bot response
        const botResponse = await generateBotResponse(userMessage);
        chatBody.removeChild(typingIndicator);
        
        const botMessageElement = createMessageElement(botResponse, "bot");
        chatBody.appendChild(botMessageElement);
        
        // Store in message history
        chatState.messageHistory.push({
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        chatState.messageHistory.push({
            type: 'bot',
            content: botResponse,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('Error handling message:', error);
        const errorMessage = createMessageElement(
            "Sorry, something went wrong. Please try again.",
            "error"
        );
        chatBody.appendChild(errorMessage);
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
        chatState.isProcessing = false;
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
};

// Event Listeners
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && !e.shiftKey && userMessage) {
        e.preventDefault();
        handleOutgoingMessage(userMessage);
    }
});

sendButton.addEventListener('click', () => {
    const userMessage = messageInput.value.trim();
    if (userMessage) {
        handleOutgoingMessage(userMessage);
    }
});

// Add input validation
messageInput.addEventListener("input", (e) => {
    const isEmpty = !e.target.value.trim();
    sendButton.disabled = isEmpty;
});

// Optional: Add a function to clear chat history
const clearChat = () => {
    chatBody.innerHTML = '';
    chatState.messageHistory = [];
};