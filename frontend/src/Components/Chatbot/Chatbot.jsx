import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import { FaSmile, FaMicrophone, FaPaperclip } from "react-icons/fa";
import "./Chatbot.css";
import axios from "axios";
import jsPDF from "jspdf";
import logo from '../../assets/Astrap_nobg.png';
import astraAvatar from '../../assets/Astra_nobg.png';
import userAvatar from '../../assets/woman.png';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Link } from 'react-router-dom'
import Avatar from "react-avatar";
import UserUpdate from "../UserUpdate/UserUpdate";
import ChangePassword from "../ChangePassword/ChangePassword"
import DeleteAccount from "../DeleteAccount/DeleteAccount";


const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am Astra. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatHistory, setChatHistory] = useState(["Chat 1", "Chat 2", "Chat 3"]);
  const [sessionId, setSessionId] = useState(null);
  const [openUserUpdate, setOpenUserUpdate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const navigate = useNavigate();
  const profileUrl = localStorage.getItem("url");

  const messagesEndRef = useRef(null);

  const user_fname = localStorage.getItem("fname");
  const user_lname = localStorage.getItem("lname");
  const user_email = localStorage.getItem("email");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // speech to text functionality
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [listening, setListening] = useState(false);


  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (!browserSupportsSpeechRecognition) {
        alert("Your browser doesn't support speech recognition. Please try using a different browser.");
      } else if (!SpeechRecognition.isMicrophoneAvailable) {
        try {
          // Request microphone access
          await navigator.mediaDevices.getUserMedia({ audio: true });
          // alert("Microphone access granted. You can now use speech recognition.");
        } catch (error) {
          alert("Microphone access is required. Please enable it in your browser settings.");
        }
      }
    };

    checkMicrophonePermission();
  }, []);





  // Use effect to update input with the transcript
  useEffect(() => {
    setInput(transcript);
    console.log(transcript);

  }, [transcript]);

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

  const handleClickDelete = () => {
    setOpenDelete(!openDelete)
  }


  const handleToggleListening = () => {
    if (listening) {
      // Stop listening
      setListening(false);
      SpeechRecognition.stopListening();
    } else {
      // Start listening
      setListening(true);
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  };



  // Generate PDF with Lodash for chunking and Day.js for timestamp
  const generatePDFReport = (responseText) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 7;
        let cursorY = 40;
        let pageNumber = 1;

        // Convert the imported logo to a data URL
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
            doc.setFillColor(0, 0, 0);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, "F");

            const logoX = -2;
            const logoY = -4;
            const logoWidth = 50;
            const logoHeight = 50;
            doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

            // Center aligned heading
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            const headingText = "Astra's Security Analysis";
            const headingWidth = doc.getStringUnitWidth(headingText) * 16 / doc.internal.scaleFactor;
            const headingX = (pageWidth - headingWidth) / 2 + margin;
            doc.text(headingText, headingX, 12);

            // Center aligned timestamp
            doc.setFontSize(10);
            const timestampText = `Generated on: ${new Date().toLocaleString()}`;
            const timestampWidth = doc.getStringUnitWidth(timestampText) * 10 / doc.internal.scaleFactor;
            const timestampX = (pageWidth - timestampWidth) / 2 + margin;
            doc.text(timestampText, timestampX, 23);
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
                console.log(`Adding new page. Current page: ${pageNumber}`);
                addPageNumber();
                doc.addPage();
                pageNumber++;
                cursorY = 40;
                addHeader();
                doc.setTextColor(0, 0, 0);
                console.log(`New page added. Current page: ${pageNumber}`);
              }
              doc.text(line, margin, cursorY);
              console.log(`Adding line on page ${pageNumber} at Y: ${cursorY}`);
              cursorY += lineHeight;
            });
          };

          // First page
          addHeader();
          addContent(responseText);
          addPageNumber();

          // Generate PDF as base64 string
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


  // Function to trigger PDF generation and download
  const generateAndDownloadPDF = async (responseText) => {
    try {
      const pdfBase64 = await generatePDFReport(responseText);

      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = 'Security_Report.pdf';
      link.click();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Usage
  const checkKeywordsAndGeneratePDF = (responseText) => {
    const keywords = ["URL", "Domain", "Server"];
    const matchedKeywords = keywords.filter((keyword) =>
      responseText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      console.log("Generating multi-page PDF report");
      generateAndDownloadPDF(responseText);
      return true;
    }
    console.log("No keywords matched, skipping PDF generation");
    return false;
  };


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
          handleHistory();
        }
        if (!sessionId) {
          setSessionId(response.data.session.session_id);
        }

        const botResponse = response.data.session.response;
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: botResponse },
        ]);

        // Check for keywords and generate PDF if matched
        const pdfGenerated = checkKeywordsAndGeneratePDF(botResponse);
        if (pdfGenerated) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "A PDF report has been generated and downloaded based on the keywords found in the response." },
          ]);
        }
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

      const response = await axios.get(
        `http://localhost:5000/api/v1/chat/${session_id}`,
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
          <img src={logo} alt="Astra Logo" />
        </div>
        <div className="class-menu">

          <h2>Menu</h2>
          <ul className="menu-items">
            <li><i className="fas fa-home"></i> Home</li>
            <li><i className="fas fa-plus"></i> New Chat</li>
            <li><i className="fas fa-cog"></i> Settings</li>
            <li><i className="fas fa-question-circle"></i> Help</li>
          </ul>
        </div>
        <div className="class-chat-history">
          <h2>Chat History</h2>
          <ul className="chat-history">
            {chatHistory.map((chat, index) => (
              <li
                key={index}
                onClick={() => handleChatHistoryClick(chat.session_id)}
                className={`chat-history-item ${sessionId === chat.session_id ? "active" : ""
                  }`}
              >
                {chat.chat_name}
              </li>
            ))}
          </ul>
        </div>
        <div className="subscription-label">
          <img src={userAvatar} alt="User Avatar" className="user-avatar" />
          <span>Welcome, Emma</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-wrapper">
        <div className="header-section">
          <h1 className="page-heading"></h1>
          <div className="profile-section">
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
                  objectFit: "cover"
                }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              />
            ) : (
              <Avatar
                className="actual-user-avatar"
                name={`${localStorage.getItem("fname") || "User"} ${localStorage.getItem("lname") || "Name"
                  }`}
                size="50"
                round={true}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ cursor: "pointer" }}
              />
            )}
            {showProfileDropdown && (
              <div className="profile-dropdown">
                {/* <UserProfile /> */}
                <div className="user-profile">
                  <div className="user-profile-content">
                    <div className="user-profile-details">
                      <div className="user-profile-field">
                        <span className="user-field-value">{user_fname}  {user_lname}</span>
                      </div>
                      <div className="profile-field">
                        <span className="user-field-value">{user_email}</span>
                      </div>
                    </div>
                    <div className="user-profile-actions">
                      <button
                        className="user-action-button update-button"
                        onClick={handleClickUpdate}
                      >
                        Update Profile
                      </button>
                      {/* {openUserUpdate && <UserUpdate />} */}
                      <button
                        className="user-action-button change-password-button"
                        onClick={handleClickPasswordChange}
                      >
                        Change Password
                      </button>
                      <button className="user-action-button logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                      <button className="user-action-button delete-button" onClick={handleClickDelete}>
                        Delete Account
                      </button>

                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>


        {/* Chat Interface */}
        <div className="chatbot-content">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <div className="bot-message-container">
                    <img src={astraAvatar} alt="Astra Avatar" className="astra-avatar" />
                    <div className="message bot">
                      <ReactMarkdown
                        className="markdown-content"
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
                        {msg.text}
                      </ReactMarkdown>

                    </div>
                  </div>
                ) : (
                  <div className="message user">
                    <ReactMarkdown

                    >
                      {msg.text}
                    </ReactMarkdown>

                  </div>
                )}
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
            {/* <FaMicrophone className="icon-microphone" /> */}
            <button
              className="microphone-button"
              onClick={handleToggleListening}
            >
              {listening ? (
                <i class="fa-solid fa-circle-pause"></i>
              ) : (
                <i className="fa-solid fa-microphone"></i>
              )}
            </button>
            <button onClick={handleSend}>&#x27A4;</button>
          </div>
        </div>
      </div>
      {openUserUpdate && <UserUpdate closeModal={setOpenUserUpdate} />}
      {openChangePassword && <ChangePassword closeModal={(setOpenChangePassword)} />}
      {openDelete && <DeleteAccount onCancel={(setOpenDelete)} />}
    </div>
  );
};

export default Chatbot;
