import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaSmile, FaMicrophone, FaPaperclip } from "react-icons/fa";
import "./Chatbot.css";
import axios from "axios";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatHistory, setChatHistory] = useState(["Chat 1", "Chat 2", "Chat 3"]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: "user", text: input }]);
      try {
        setInput("");
        const response = await axios.post("http://localhost:8000/chat", {
          prompt: input.trim(),
        });
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: response.data.response },
        ]);
      } catch (error) {
        console.error("Error fetching bot response:", error);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I'm sorry, something went wrong while fetching the response.",
          },
        ]);
      }
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
    <div className="chatbot-wrapper">
      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <div className="astra-logo">
          <img
            src="https://via.placeholder.com/60" // Replace with Astra logo URL
            alt="Astra Logo"
          />
        </div>
        <h2>Menu</h2>
        <ul className="menu-items">
          <li>Home</li>
          <li>Chat</li>
          <li>Settings</li>
          <li>Help</li>
        </ul>
        <h2>Chat History</h2>
        <ul className="chat-history">
          {chatHistory.map((chat, index) => (
            <li key={index}>{chat}</li>
          ))}
        </ul>
        <div className="subscription-label">
          <span>Subscribe to Premium</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-wrapper">
        {/* Header */}
        <div className="header-section">
          <h1 className="page-heading">Welcome to Astra</h1>
          <div className="user-logo">
            <img
              src="https://via.placeholder.com/60" // Replace with User logo URL
              alt="User Logo"
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="chatbot-content">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
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
    </div>
  );
};

export default Chatbot;
