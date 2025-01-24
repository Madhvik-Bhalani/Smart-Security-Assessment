import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaSmile, FaMicrophone, FaPaperclip } from "react-icons/fa";
import "./Chatbot.css";
import axios from "axios";
import { Link } from 'react-router-dom'
import Avatar from "react-avatar";


const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatHistory, setChatHistory] = useState(["Chat 1", "Chat 2", "Chat 3"]);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // useEffect(() => {
  //   handleHistory()
  // }, [chatHistory])
  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: "user", text: input }]);
      try {
        setInput("");
        const token = localStorage.getItem("token");
        const endpoint = sessionId
          ? `http://localhost:5000/api/v1/chat/${sessionId}`
          : `http://localhost:5000/api/v1/chat/first-message`;

        const response = await axios.post(
          endpoint,
          {
            userPrompt: input.trim(),
          },
          {
            headers: {
              token: `${token}`,
            },
          }
        );

        if (response) {
          handleHistory()
        }
        if (!sessionId) {
          setSessionId(response.data.session.session_id);
        }

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: response.data.session.response },
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

  const handleChatHistoryClick = async (session_id) => {
    try {
      const token = localStorage.getItem("token");
      // console.log(session_id)

      const response = await axios.get(
        `http://localhost:5000/api/v1/chat/${session_id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // console.log("response", response.data.message)

      if (response && response.data) {
        setMessages(
          response.data.map((msg) => ({
            sender: msg.sender,
            text: msg.text,
          }))
        );
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
      setMessages([
        {
          sender: "bot",
          text: "Unable to fetch the chat history. Please try again later.",
        },
      ]);
    }
  };

  const handleHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/v1/chat", {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response && response.data) {
        setChatHistory(response.data.sessions);
        // console.log("Chat history", chatHistory)
        // console.log("Sessions:", response.data.sessions);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      console.error("Error fetching history:", error.message);
    }
  };

  useEffect(() => {
    handleHistory();
  }, []);

  return (
    <div className="chatbot-wrapper">
      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <div className="astra-logo">
          <img
            src="https://via.placeholder.com/60"
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
            // console.log(chat.session_id)
            <li
              key={index}
              onClick={() => handleChatHistoryClick(chat.session_id)}
              className="chat-history-item"
            >
              {chat.chat_name}
            </li>
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
          <Link to="/profile">
            <Avatar name={`${localStorage.getItem("fname")} ${localStorage.getItem("lname")}`} size="50" round = {true}/>
          </Link>

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
                {[
                  "😀", "😂", "❤️", "👍", "😭", "🎉", "😎", "🙌",
                ].map((emoji) => (
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
