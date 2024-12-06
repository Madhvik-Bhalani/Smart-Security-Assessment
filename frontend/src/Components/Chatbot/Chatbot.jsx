import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Toggles chatbot open/close
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  // Handles message sending
  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);

      // Simulate bot response
      const botResponse = handleBotResponse(input.trim().toLowerCase());
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      }, 500);

      setInput(''); // Clear input field
    }
  };

  // Generates bot responses for static commands
  const handleBotResponse = (command) => {
    switch (command) {
      case 'hello':
        return 'Hi there! How can I help you today?';
      case 'help':
        return 'Here are some commands you can try: "hello", "help", "pricing", "contact".';
      case 'pricing':
        return 'Our pricing starts at $10/month. For details, visit our Pricing page!';
      case 'contact':
        return 'You can contact us at support@codefinity.com.';
      default:
        return "I'm sorry, I didn't understand that. Try typing 'help' for available commands.";
    }
  };

  // Handles file uploads
  const handleFileUpload = (event) => {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: `Uploaded file: ${fileName}` },
      ]);
    }
  };

  // Handles emoji clicks
  const handleEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="app-container" style={{ background: 'black', height: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <h1>Codefinity</h1>
        <ul className="navbar-links">
          <li>Contact Us</li>
          <li>About</li>
          <li>Pricing</li>
          <li>Codefinity</li>
          <li>Login/Signup</li>
        </ul>
      </nav>

      {/* Chatbot */}
      {isChatbotOpen && (
        <div className="chatbot-overlay">
          <div className="chatbot-container chatbot-center">
            <div className="chat-window">
              <div className="chat-header">
                <h3>Astra</h3>
                <button onClick={toggleChatbot}>✖</button>
              </div>
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {['😀', '😂', '❤️', '👍', '😭', '🎉', '😎', '🙌'].map((emoji) => (
                      <span
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="emoji"
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Enter your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <label htmlFor="file-upload">
                  <i className="icon-upload">📁</i>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <i
                  className="icon-emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </i>
                <button onClick={handleSend}>&#x27A4;</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isChatbotOpen && (
        <div className="chatbot-avatar" onClick={toggleChatbot}>
          <img src={require('../../assets/Avatar.png')} alt="Chatbot Avatar" />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
