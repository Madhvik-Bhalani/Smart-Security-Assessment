import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {FaPaperclip, FaMoon, FaSun, FaCheckCircle, FaPlus, FaSignOutAlt, FaEllipsisV, FaStore, FaTrash, FaEdit, FaRegCreditCard, FaLock } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import "./Chatbot.css";
import axios from "axios";
import jsPDF from "jspdf";
import logo from '../../assets/Astrap_nobg.png';
import astraAvatar from '../../assets/Astra_nobg.png';
import astraLogo from '../../assets/Astrap_nobg.png';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useNavigate } from 'react-router-dom';
import UserUpdate from "../UserUpdate/UserUpdate";
import ChangePassword from "../ChangePassword/ChangePassword"
import DeleteAccount from "../DeleteAccount/DeleteAccount";
import Avatar from 'react-avatar';

const Chatbot = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am Astra. How can I assist you today?", timestamp: new Date().toLocaleTimeString() },
  ]);
  const [input, setInput] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [openUserUpdate, setOpenUserUpdate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const navigate = useNavigate();
  const profileUrl = localStorage.getItem("url");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [listening, setListening] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileDropdownRef =useRef(null);

  const user_fname = localStorage.getItem("fname");
  const user_lname = localStorage.getItem("lname");
  const user_email = localStorage.getItem("email");

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const safelyParseJSON = (json) => {
    try {
      return JSON.parse(json);
    } catch (e) {
   
      return {};
    }
  };
  
  const safelyStringifyJSON = (obj) => {
    try {
      return JSON.stringify(obj);
    } catch (e) {
     
      return '{}';
    }
  };
 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustInputHeight();
  };

const saveChatHistory = (sessionId, messages, chatName) => {
  const chatHistory = safelyParseJSON(localStorage.getItem('chatHistory') || '{}');
  chatHistory[sessionId] = { messages, chatName, lastUpdated: new Date().toISOString()};
  localStorage.setItem('chatHistory', safelyStringifyJSON(chatHistory));
};

const loadChatHistory = () => {
  return safelyParseJSON(localStorage.getItem('chatHistory') || '{}');
};
  const adjustInputHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, window.innerHeight * 0.3)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
    const theme = !isDarkTheme ? "dark" : "light";
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  };

  const handleClickOutside = (event) => {
    if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
      setShowProfileDropdown(false);
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowUserMenu(null);
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setIsDarkTheme(savedTheme === "dark");
    document.body.classList.add(savedTheme);
  }, []);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (!browserSupportsSpeechRecognition) {
        alert("Your browser doesn't support speech recognition. Please try using a different browser.");
      } else if (!SpeechRecognition.isMicrophoneAvailable) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          alert("Microphone access is required. Please enable it in your browser settings.");
        }
      }
    };

    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  const handleToggleListening = () => {
    if (listening) {
      setListening(false);
      SpeechRecognition.stopListening();
    } else {
      setListening(true);
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }
  };
  const cleanMarkdownText = (text) => {
    return text
      .replace(/#{1,6}\s?/g, '')       // Remove headers
      .replace(/\*\*/g, '')            // Remove bold
      .replace(/\*/g, '')              // Remove italic
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
      .replace(/`/g, '')               // Remove inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with just the text
      .replace(/^\s*[-*+]\s/gm, '')    // Remove list markers
      .replace(/^\s*\d+\.\s/gm, '')    // Remove numbered list markers
      .replace(/\n{3,}/g, '\n\n')      // Replace multiple newlines with double newlines
      .trim();
  };
  const extractUrlFromInput = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    if (!matches) return null; // No URL found

    let url = matches[0]; // Get first matched URL

    // ✅ Remove trailing symbols like `/`, `?`, `.`, etc.
    url = url.replace(/[\/?.,]+$/, ""); 

    return url;
};

const checkUrlAndGeneratePDF = (responseText, extractedUrl) => {
  if (!extractedUrl) return false; // Exit early if no URL

  // ✅ Normalize extracted URL (remove protocol and fragment)
  const sanitizedUrl = extractedUrl
      .replace(/https?:\/\//, "")  // Remove http/https
      .replace(/\/$/, "")          // Remove trailing slash
      .split("#")[0]               // Remove fragment (#q=trash)
      .toLowerCase();              // Convert to lowercase for case-insensitive match

  // ✅ Normalize response text
  const sanitizedResponse = responseText.toLowerCase();

  // ✅ Check if URL exists in response
  if (sanitizedResponse.includes(sanitizedUrl)) {
      generateAndDownloadPDF(responseText);
      return true;
  } else {
      setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `The URL (${extractedUrl}) was not found exactly in the response. No PDF generated.`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return false;
  }
};


  const generatePDFReport = (responseText) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 7;
        let cursorY = 55;
        let pageNumber = 1;

        const cleanedText = cleanMarkdownText(responseText);

        const img = new Image();
        img.src = logo;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const logoDataUrl = canvas.toDataURL('image/png');

          const addHeader = () => {
           // doc.setFillColor(0, 0, 0);
           // doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, "F");

            const logoX = -2;
            const logoY = -4;
            const logoWidth = 50;
            const logoHeight = 50;
            doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            const headingText = "Astra's Security Analysis";
            const headingWidth = doc.getStringUnitWidth(headingText) * 16 / doc.internal.scaleFactor;
            const headingX = (pageWidth - headingWidth) / 2 + margin;
            doc.text(headingText, headingX, 25);

           

            doc.setFontSize(10);
            const timestampText = `Generated on: ${new Date().toLocaleString()}`;
            const timestampWidth = doc.getStringUnitWidth(timestampText) * 10 / doc.internal.scaleFactor;
           // const timestampX = (pageWidth - timestampWidth) / 2 + margin;
           const timestampX = pageWidth + margin - timestampWidth; 
           doc.text(timestampText, timestampX, 38);
          

           doc.setDrawColor(0);
           doc.line(margin, 45, pageWidth + margin, 45);
            
          };

          const addPageNumber = () => {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Page ${pageNumber}`, doc.internal.pageSize.getWidth() - 25, pageHeight - 10);
          };

          const addContent = (text) => {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            const splitText = doc.splitTextToSize(text, pageWidth);

            splitText.forEach((line) => {
              if (cursorY > pageHeight - 20) {
                addPageNumber();
                doc.addPage();
                pageNumber++;
                cursorY = 55;
                addHeader();
                doc.setTextColor(0, 0, 0);
              }
              doc.text(line, margin, cursorY);
              cursorY += lineHeight;
            });
          };

          addHeader();
          addContent(cleanedText);
          addPageNumber();

          const pdfBase64 = doc.output('datauristring');
          resolve(pdfBase64);
        };

        img.onerror = (error) => {
          reject(new Error('Failed to load logo image'));
        };

      } catch (error) {
        reject(error);
      }
    });
  };

  const generateAndDownloadPDF = async (responseText) => {
    try {
      const pdfBase64 = await generatePDFReport(responseText);
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = 'Security_Analysis_Report.pdf';
      link.click();
    } catch (error) {
    }
  };

  const checkKeywordsAndGeneratePDF = (responseText) => {
    const keywords = ["URL", "Domain", "Server"];
    const matchedKeywords = keywords.filter((keyword) =>
      responseText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      generateAndDownloadPDF(responseText);
      return true;
    }
    return false;
  };

  const handleSend = async () => {
    if (input.trim()) {

      const extractedUrl = extractUrlFromInput(input);

      setMessages((prev) => [
        ...prev,
        { sender: "user", text: input, timestamp: new Date().toLocaleTimeString() },
        { sender: "bot", text: "Analyzing...", timestamp: new Date().toLocaleTimeString(), isLoading: true }
      ]);
      setIsLoading(true);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
  
      try {
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
          handleHistory();
        }
        if (!sessionId) {
          setSessionId(response.data.session.session_id);
        }
  
        const botResponse = response.data.session.response;
        setMessages((prev) => [
          ...prev.filter(msg => !msg.isLoading),
          { sender: "bot", text: botResponse, timestamp: new Date().toLocaleTimeString() },
        ]);
  
        setTimeout(() => {
          if (extractedUrl) {
              checkUrlAndGeneratePDF(botResponse, extractedUrl);
          }
      }, 500); 
      

        // const pdfGenerated = checkKeywordsAndGeneratePDF(botResponse);
        // if (pdfGenerated) {
        //   setMessages((prev) => [
        //     ...prev,
        //     { sender: "bot", text: "A PDF report has been generated and downloaded based on the keywords found in the response.", timestamp: new Date().toLocaleTimeString() },
        //   ]);
        // }
      } catch (error) {
        setMessages((prev) => [
          ...prev.filter(msg => !msg.isLoading),
          {
            sender: "bot",
            text: "I'm sorry, something went wrong while fetching the response.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  

  const handleFileUpload = (event) => {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `Uploaded file: ${fileName}`, timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  };

  const handleChatHistoryClick = async (sessionId) => {
    try {


      setSessionId(sessionId) // Enabling chat in the previous session for follow-up questions.

      const token = localStorage.getItem("token");
  
      const response = await axios.get(
        `http://localhost:5000/api/v1/chat/${sessionId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response && response.data) {
        setMessages(
          response.data.map((msg) => ({
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          }))
        );
        setSessionId(sessionId);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      setMessages([
        {
          sender: "bot",
          text: "Unable to fetch the chat history. Please try again later.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };
  

  const handleHistory = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.get("http://localhost:5000/api/v1/chat", {
        headers: {
          Authorization: token
        },
      });
      if (response && response.data && response.data.sessions) {
        const sortedSessions = response.data.sessions
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)) // Sort by lastUpdated descending
          .map((session) => ({
            id: session.session_id,
            name: session.chat_name || `Chat ${session.session_id}`,
          }));
  
        setChatHistory(sortedSessions);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
    }
  };
  
  
  
  const handleBackCheck = (message) => {
  
    alert(`Back-checking: ${message}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/")
  };

  

  const handleClickPasswordChange = () => {
    setOpenChangePassword(!openChangePassword)
  }

  const handleClickUpdate = () => {
    setOpenUserUpdate(!openUserUpdate)
  }
  const handleChatRename = async (sessionId, newName) => {
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/v1/chat/${sessionId}/rename`,
        { new_chat_name: newName },
        {
          headers: {
            "Authorization":  token
          },
        }
      );
  
      if (response.data.status === "success") {
        
        handleHistory();
      } else {
      throw new Error(response.data.message || "Failed to rename chat");
      }
    } catch (error) {
     
  
      alert("Failed to rename chat. Please try again.");
    }
  };
  
  const handleClickDelete = () => {
    setOpenDelete(!openDelete);
  }

  const handleChatDelete = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/v1/chat/delete`,
        { session_id: sessionId },
        {
          headers: {
            "Authorization":  token
          },
        }
      );
      if (response.data.status === "success") {
     
        handleHistory();
      } else {
        
      throw new Error(response.data.message || "Failed to delete chat");
      }
    } catch (error) {

  
      alert("Failed to delete chat. Please try again.");
    }
    
  }
  
  const handleChatAction = (action, chatId) => {
    switch(action) {
      case 'rename':
        const newName = prompt('Enter new chat name:');
        if (newName) handleChatRename(chatId, newName);
        break;
      case 'delete':
        if (chatId) handleChatDelete(chatId);
    
        break;
      default:
    }
  };

  useEffect(() => {
    handleHistory();
  }, []);

  const newchatHandler = () => {
    setMessages([
      { sender: "bot", text: "Hello! I am Astra. How can I assist you today?" },
    ]);
    setSessionId(null);
    setInput("");
  };
  

  return (
<div className="chatbot-wrapper">
      {/* Sidebar */}
      <div className="chatbot-sidebar">
      <div className="sidebar-header">
    <img src={astraLogo} alt="Astra Logo" className="sidebar-logo" />
  </div>
  <div className="sidebar-actions">
    <button className="action-btn new-chat-btn" onClick={newchatHandler}>
      <FaPlus /> New Chat
    </button>
    {/*<button className="action-btn marketplace-btn">
      <FaStore /> Marketplace
    </button>*/}
  </div>
       
{/* Chat History */}
<div className="chat-history-section">
  <div className="chat-history-header">Chat History</div>
  <div className="chat-history">
    {chatHistory.map((chat) => (
      <div key={chat.id} className="chat-item" onClick={() => handleChatHistoryClick(chat.id)}>
        <span>{chat.name}</span>
        
        <div className="chat-actions">
          <FaEllipsisV onClick={(e) => { e.stopPropagation(); setShowUserMenu(chat.id); }} />
          {showUserMenu === chat.id && (
           
           <div className="chat-dropdown" ref={dropdownRef}>
  <button
    className="dropdown-item"
    onClick={(e) => {
      e.stopPropagation();
      handleChatAction("rename", chat.id);
    }}
  >
    <span className="dropdown-icon">
      <FaEdit />
    </span>
    <span className="dropdown-text">Rename</span>
  </button>
  <button
    className="dropdown-item delete-item"
    onClick={(e) => {
      e.stopPropagation();
      handleChatAction("delete", chat.id);
    }}
  >
    <span className="dropdown-icon">
      <FaTrash />
    </span>
    <span className="dropdown-text">Delete</span>
  </button>
</div>

         
          )}
        </div>

      </div>
    ))}
  </div>
</div>


        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
      

      {/* Main Content */}
      <div className="main-content">

      <div className="header-actions">
           <div className="header-icons">
  <button onClick={handleToggleTheme} className="theme-toggle" aria-label="Toggle Theme">
    {isDarkTheme ? <FaSun /> : <FaMoon />}
  </button>
  <div className="user-menu">
  {profileUrl ? (
    <img
      className="actual-user-avatar"
      src={profileUrl}
      alt="Profile"
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        cursor: "pointer",
        objectFit: "cover",
      }}
      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
    />
  ) : (
    <Avatar
      className="actual-user-avatar"
      name={`${
        localStorage.getItem("fname") || "User"
      } ${localStorage.getItem("lname") || "Name"}`}
      size="50"
      round={true}
      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
      style={{ cursor: "pointer" }}
    />
  )}
  {showProfileDropdown && (

    <div className="dropdown profile-dropdown" ref={profileDropdownRef}>
      <div className="user-profile-details">
        <span className="user-field-value">{user_email}</span>
      </div>
      <div className="user-profile-actions">
        <button
          className="user-action-button update-button"
          onClick={handleClickUpdate}
        >
          <span className="action-icon">
        <FaEdit />
      </span>
          Update Profile
        </button>
        <button
          className="user-action-button change-password-button"
          onClick={handleClickPasswordChange}
        >
          <span className="action-icon">
        <FaLock />
      </span>
          Change Password
        </button>
        <button
          className="user-action-button logout-button"
          onClick={handleLogout}
        >
          <span className="action-icon">
        <FaRegCreditCard />
      </span>
          Subscription
        </button>
        <button
          className="user-action-button delete-button"
          onClick={handleClickDelete}
        >

      <span className="action-icon">
        <FaTrash />
      </span>
          Delete Account
        </button>
      </div>
    </div>
  )}
</div>

</div>

      </div>
      <div className="chat-messages">
  {messages.map((msg, index) => (
    <div key={index} className={`message ${msg.sender}`}>
      {msg.sender === "bot" && (
        <img src={astraAvatar} alt="Bot Avatar" className="message-avatar" />
      )}
      <div className={`message-text ${msg.isLoading ? 'loading-indicator' : ''}`}>
        {msg.isLoading ? (
          <div className="loading-text">
            <span>Analyzing</span>
            <span className="dot-animation">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        ) : (
          <ReactMarkdown
            className={msg.sender === "bot" ? "markdown-content" : ""}
            components={{
              h1: ({ node, ...props }) => <h1 {...props} className="section-header" />,
              h2: ({ node, ...props }) => <h2 {...props} />,
              p: ({ node, ...props }) => <p {...props} />,
              ul: ({ node, ...props }) => <ul {...props} />,
              li: ({ node, ...props }) => <li {...props} />,
              pre: ({ node, ...props }) => <pre className="code-block" {...props} />,
              code: ({ node, ...props }) => <code className="inline-code" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="highlight-box" {...props} />,
            }}
          >
            {typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)}
          </ReactMarkdown>
        )}
      </div>
      {msg.sender === "bot" && !msg.isLoading && (
        <div className="fact-check" onClick={() => handleBackCheck(msg.text)}>
          <FaCheckCircle />
        </div>
      )}
    </div>
  ))}
  <div ref={messagesEndRef}></div>
</div>



        <div className="chat-input">
           <textarea
        ref={inputRef}
        placeholder="Type your message..."
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="chat-input-textarea"
        aria-label="Type your message. Press Enter to send or Shift + Enter for a new line."
      />
          {/*<button htmlFor="file-upload">
            <FaPaperclip  />
          </button>*/}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button className="microphone-button" onClick={handleToggleListening}>
            {listening ? <i className="fa-solid fa-circle-pause"></i> : <i className="fa-solid fa-microphone"></i>}
          </button>
          <button onClick={handleSend} className="send-button"><LuSend /></button>
        </div>
      </div>
      {openUserUpdate && <UserUpdate closeModal={setOpenUserUpdate} />}
      {openChangePassword && <ChangePassword closeModal={(setOpenChangePassword)} />}
      {openDelete && <DeleteAccount onCancel={(setOpenDelete)} />}
    </div>
  );
};

export default Chatbot;