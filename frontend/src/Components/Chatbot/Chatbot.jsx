import React, { useState } from "react";
import { FaSmile, FaMicrophone, FaPaperclip, FaTimes } from "react-icons/fa"; // Import icons
import "./Chatbot.css";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: "user", text: input }]);
      const botResponse = handleBotResponse(input.trim().toLowerCase());
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      }, 500);
      setInput(""); // Clear input
    }
  };

  const handleBotResponse = (command) => {
    switch (command) {
      case "hello":
        return "Hi there! How can I help you today?";
      case "help":
        return "Here are some commands you can try: 'hello', 'help', 'pricing', 'contact'.";
      case "pricing":
        return "Our pricing starts at $10/month. For details, visit our Pricing page!";
      case "contact":
        return "You can contact us at support@codefinity.com.";
      default:
        return "I'm sorry, I didn't understand that. Try typing 'help' for available commands.";
    }
  };

  const handleFileUpload = (event) => {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `Uploaded file: ${fileName}` },
      ]);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        <div className="chat-header">
        <h1>Just a normal chatbot!</h1>

          <FaTimes className="close-button" onClick={onClose} />
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          {showEmojiPicker && (
            <div className="emoji-picker">
              {["😀", "😂", "❤️", "👍", "😭", "🎉", "😎", "🙌"].map((emoji) => (
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
          <FaSmile
            className="icon-emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />

          <input
            type="text"
            placeholder="Enter your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />

          <label htmlFor="file-upload">
            <FaPaperclip className="icon-upload" />
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          <FaMicrophone className="icon-microphone" />

          <button onClick={handleSend}>&#x27A4;</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
