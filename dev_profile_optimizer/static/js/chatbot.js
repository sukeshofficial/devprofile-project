// Chatbot functionality
console.log('Chatbot script loaded');

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.initialize();
    }

    initialize() {
        console.log('Initializing chatbot...');
        
        // Create chatbot container
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = this.isOpen ? 'open' : '';
        console.log('Created chatbot container:', container);

        // Chatbot header
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-robot mr-2"></i>
                <span class="font-semibold">Learning Assistant</span>
            </div>
            <button id="toggleChatbot">
                <i class="fas ${this.isOpen ? 'fa-times' : 'fa-comment'}"></i>
            </button>
        `;

        // Chat messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'chatbot-messages';
        messagesContainer.id = 'chat-messages';

        // Chat input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chatbot-input';
        inputContainer.innerHTML = `
            <div class="flex">
                <input type="text" id="chat-input" 
                       class="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                       placeholder="Ask me anything...">
                <button id="send-message" class="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 focus:outline-none">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        // Assemble the chatbot
        container.appendChild(header);
        container.appendChild(messagesContainer);
        container.appendChild(inputContainer);
        document.body.appendChild(container);

        // Add event listeners
        header.addEventListener('click', () => this.toggleChat());
        document.getElementById('send-message').addEventListener('click', () => this.handleSendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });

        // Add welcome message
        this.addMessage('bot', '👋 Hi there! I\'m your learning assistant. How can I help you today?');
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chatbot-container');
        const toggleBtn = document.querySelector('#toggleChatbot i');
        
        if (this.isOpen) {
            container.classList.add('open');
            document.getElementById('chat-input').focus();
        } else {
            container.classList.remove('open');
        }
        
        if (toggleBtn) {
            toggleBtn.className = `fas ${this.isOpen ? 'fa-times' : 'fa-comment'}`;
        }
    }

    addMessage(sender, text) {
        this.messages.push({ sender, text });
        this.renderMessages();
        this.scrollToBottom();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';

        this.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = msg.text;
            messagesContainer.appendChild(messageDiv);
        });
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        this.addMessage('bot', '...');
        
        try {
            // In a real app, you would send this to your backend
            const response = await this.getBotResponse(message);
            
            // Remove typing indicator
            this.messages = this.messages.filter(msg => msg.text !== '...');
            
            // Add bot response
            this.addMessage('bot', response);
        } catch (error) {
            console.error('Error getting bot response:', error);
            this.addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
        }
    }

    async getBotResponse(message) {
        // Simple responses - in a real app, this would call your backend
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hello! How can I assist you with your learning journey today?';
        } else if (lowerMessage.includes('progress')) {
            return 'You can check your learning progress in the progress tracker section. Would you like me to take you there?';
        } else if (lowerMessage.includes('skills') && lowerMessage.includes('learn')) {
            return 'Based on your profile, I recommend focusing on these skills: JavaScript, Python, and React. Would you like me to create a learning plan for you?';
        } else if (lowerMessage.includes('help')) {
            return 'I can help you with: \n- Tracking your learning progress\n- Recommending skills to learn\n- Answering questions about your learning path\n- Setting learning goals\n\nWhat would you like to know?';
        } else {
            return 'I\'m here to help with your learning journey! You can ask me about your progress, skills to learn, or any other questions you have.';
        }
    }
}
