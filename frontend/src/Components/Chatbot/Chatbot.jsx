import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from "react-router-dom";
import { FaSmile, FaMicrophone, FaPaperclip, FaTimes } from "react-icons/fa"; // Import icons
import "./Chatbot.css";
import axios from "axios"

const Chatbot = () => {

  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Ref for the messages container
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Handles message sending to the server
  const handleSend = async () => {

    if (input.trim()) {
      // Add user's message to the chat
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);

      // Send POST request to the server
      try {
        // Clear the input field
        setInput('');

        const response = await axios.post('http://localhost:5000/api/v1/chat', {
          prompt: input.trim(),
          user_chat_session_id: "test2"
        });


        // Add bot's response to the chat
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: response.data.data },
        ]);
      } catch (error) {
        console.error('Error fetching bot response:', error);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: "I'm sorry, something went wrong while fetching the response.",
          },
        ]);
      }


    }
  };

  const logoutHandler = () => {
    localStorage.clear() //remove all user values and token 
    navigate("/signin")

  }

  // const handleBotResponse = (command) => {
  //   switch (command) {
  //     case "hello":
  //       return "Hi there! How can I help you today?";
  //     case "help":
  //       return "Here are some commands you can try: 'hello', 'help', 'pricing', 'contact'.";
  //     case "pricing":
  //       return "Our pricing starts at $10/month. For details, visit our Pricing page!";
  //     case "contact":
  //       return "You can contact us at support@codefinity.com.";
  //     default:
  //       return "I'm sorry, I didn't understand that. Try typing 'help' for available commands.";
  //   }
  // };

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
          <h1>Smart Security Chatbot</h1>

          <FaTimes className="close-button" onClick={logoutHandler} style={{ cursor: "pointer" }} />
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <>
              {/* Dummy div for scrolling */}
              <div div ref={messagesEndRef} ></div>
              <div
                key={index}
                className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </>
          ))}
        </div >
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
