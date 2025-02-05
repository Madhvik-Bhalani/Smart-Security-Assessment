import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Joyride from "react-joyride";
import {
  FaMoon,
  FaSun,
  FaQuestionCircle,
  FaPlus,
  FaSignOutAlt,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaRegCreditCard,
  FaLock,
  FaBug,
  FaToolbox,
  FaRegFileAlt
} from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import "./Chatbot.css";
import axios from "axios";
import jsPDF from "jspdf";
import logo from "../../assets/Astrap_nobg.png";
import astraAvatar from "../../assets/Astra_nobg.png";
import astraLogo from "../../assets/Astrap_nobg.png";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import UserUpdate from "../UserUpdate/UserUpdate";
import ChangePassword from "../ChangePassword/ChangePassword";
import DeleteAccount from "../DeleteAccount/DeleteAccount";
import Avatar from "react-avatar";
import CveTable from "../CveTable/CveTable";


const Chatbot = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [runTour, setRunTour] = useState(false);



  const tourSteps = [
    {
      target: ".new-chat-btn",
      content: "Start a new conversation with Astra.",
      placement: "bottom",
    },
    {
      target: ".chat-history-section",
      content: "View and manage your chat history here.",
      placement: "right",
    },
    {
      target: ".theme-toggle",
      content: "Toggle between dark and light mode.",
      placement: "left",
    },
    {
      target: ".chat-input-textarea",
      content: "Type your message here to interact with Astra.",
      placement: "top",
    },
    {
      target: ".send-button",
      content: "Send your message to Astra.",
      placement: "top",
    },
  ];

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am Astra. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [suggestivePrompts, setSuggestivePrompts] = useState([]);
  const [isLoadingBotResponse, setIsLoadingBotResponse] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [openUserUpdate, setOpenUserUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const navigate = useNavigate();
  const profileUrl = localStorage.getItem("url");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [listening, setListening] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);


  const user_email = localStorage.getItem("email");
  const [pdfData, setPdfData] = useState(null);
  const [showFilenameModal, setShowFilenameModal] = useState(false);
  const [filename, setFilename] = useState("Security_Report");

  const [activeComponent, setActiveComponent] = useState("chat");
  const [isPopupVisible, setIsPopupVisible] = useState(false);


  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  const features = [
    { name: "Incident Checklist", path: "/incidentChecklist" },
    { name: "Marketplace", path: "/market" },
    { name: "Newsletter", path: "/newsletterpage" },
    { name: "Quiz", path: "/quiz" },
    { name: "Security Standards", path: "/securityStandards" },
  ];

  const handleFeatureClick = (path) => {
    navigate(path); 
    setShowFeaturesDropdown(false); 
  };


  const handleClickOutsideFeature = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowFeaturesDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideFeature);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFeature);
    };
  }, []);


  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

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
      return "{}";
    }
  };

  

  const [reportsData, setReportsData] = useState(false);

  const handleFetchReports = async () => {
    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fetch-reports`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response && response.data) {
        console.log("report response-->");
        console.log(response.data);

        setReportsData(response.data)
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      alert("Failed to fetch reports. Please try again.");
    }
  };


  useEffect(() => {
    handleFetchReports()
  }, [])




  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustInputHeight();
  };


  const adjustInputHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        window.innerHeight * 0.3
      )}px`;
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

  const ReportsModal = () => (
    <div className="reports-modal-overlay">
      <div className="reports-modal">
        <h3>Your Security Reports</h3>
        {isLoadingReports ? (
          <div className="loading-text">Loading reports...</div>
        ) : reports.length === 0 ? (
          <p>No reports available</p>
        ) : (
          <div className="reports-list">
            {reports.map((report, index) => (
              <div key={index} className="report-item">
                <div className="report-header">
                  <span className="report-name">{report.file_name}</span>
                  <span className="report-date">
                    {new Date(report.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="download-report-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = report.file_data;
                    link.download = report.file_name.endsWith('.pdf')
                      ? report.file_name
                      : `${report.file_name}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          className="close-modal-btn"
          onClick={() => setShowReportsModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  );


  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
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
        alert(
          "Your browser doesn't support speech recognition. Please try using a different browser."
        );
      } else if (!SpeechRecognition.isMicrophoneAvailable) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          alert(
            "Microphone access is required. Please enable it in your browser settings."
          );
        }
      }
    };

    checkMicrophonePermission();
  }, []);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (
      sessionId &&
      messages.length > 0 &&
      messages[messages.length - 1].sender === "bot" &&
      !messages[messages.length - 1].isLoading
    ) {

      const delayFetch = setTimeout(() => {
        fetchSuggestivePrompts(sessionId);
      }, 500);

      return () => clearTimeout(delayFetch);
    }
  }, [messages, sessionId]);



  const handleToggleListening = () => {
    if (listening) {
      setListening(false);
      SpeechRecognition.stopListening();
    } else {
      setListening(true);
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
    }
  };

  const cleanMarkdownText = (text) => {
    return text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`{3}[\s\S]*?`{3}/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/^\s*[-*+]\s/gm, "")
      .replace(/^\s*\d+\.\s/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const extractUrlFromInput = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    if (!matches) return null;

    let url = matches[0];

    url = url.replace(/[\/?.,]+$/, "");

    return url;
  };

  const checkUrlAndGeneratePDF = (responseText, extractedUrl) => {
    if (!extractedUrl) return false;


    const sanitizedUrl = extractedUrl
      .replace(/https?:\/\//, "")
      .replace(/\/$/, "")
      .split("#")[0]
      .toLowerCase();

    const sanitizedResponse = responseText.toLowerCase();


    if (sanitizedResponse.includes(sanitizedUrl)) {
      generateAndDownloadPDF(responseText);
      return true;
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `The URL (${extractedUrl}) was not found exactly in the response. No PDF generated.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return false;
    }
  };


  const uploadReportToDatabase = async (base64Report, fileName) => {
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        console.error("User email not found in local storage");
        return;
      }

      const payload = {
        email: userEmail,
        file_name: fileName,
        base64_file: base64Report,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/upload-report`,
        payload
      );

      if (response.status === 200 && response.data.status) {
        console.log("Report uploaded successfully!");
       
        alert("Report uploaded successfully!");
      } else {
        console.error("Failed to upload report:", response.data.message);
       
        alert("Failed to upload report. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading report:", error);
    
      alert("An error occurred while uploading the report.");
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
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const logoDataUrl = canvas.toDataURL("image/png");

          const addHeader = () => {
        
            doc.addImage(logoDataUrl, "PNG", -2, -4, 50, 50);

           
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            const headingText = "Astra's Security Analysis";
            const headingWidth =
              (doc.getStringUnitWidth(headingText) * 16) /
              doc.internal.scaleFactor;
            const headingX = (pageWidth - headingWidth) / 2 + margin;
            doc.text(headingText, headingX, 25);

        
            doc.setFontSize(10);
            const timestampText = `Generated on: ${new Date().toLocaleString()}`;
            const timestampWidth =
              (doc.getStringUnitWidth(timestampText) * 10) /
              doc.internal.scaleFactor;
            const timestampX = pageWidth + margin - timestampWidth;
            doc.text(timestampText, timestampX, 38);

         
            doc.setDrawColor(0);
            doc.line(margin, 45, pageWidth + margin, 45);
          };

          const addPageNumber = () => {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            doc.setDrawColor(0);
            doc.line(margin, pageHeight - 20, pageWidth + margin, pageHeight - 20);

            doc.text("Powered by Codefinity", margin, pageHeight - 10);

            doc.text(
              `Page ${pageNumber}`,
              doc.internal.pageSize.getWidth() - 25,
              pageHeight - 10
            );
          };

          const addContent = (text) => {
            const lines = text.split("\n");
            const boldHeadings = [
              "Overview",
              "IP and Network Information",
              "SSL/TLS Details",
              "Security Headers and Configuration",
              "Missing Headers:",
              "Findings and Vulnerabilities",
              "JavaScript and External Resources",
              "Technology Stack",
              "Related CVEs",
              "Recommendations",
              "Advanced Insights and Recommendations",
            ];

            lines.forEach((line) => {
              if (line.trim() === "") {
              
                return;
              }

              if (boldHeadings.includes(line.trim())) {
                
                doc.setFontSize(14); 
                doc.setFont("helvetica", "bold");
                doc.setTextColor(157, 78, 221); 
                cursorY += 5; 
                const wrappedText = doc.splitTextToSize(line, pageWidth); 
                doc.text(wrappedText, margin, cursorY);
                cursorY += 7; 
              } else if (line.startsWith("# ")) {
                
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 89, 152); 
                cursorY += 5;
                const wrappedText = doc.splitTextToSize(line.replace("# ", ""), pageWidth); 
                doc.text(wrappedText, margin, cursorY);
                cursorY += 10;
              } else if (line.startsWith("## ")) {
               
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 89, 152); 
                cursorY += 5;
                const wrappedText = doc.splitTextToSize(line.replace("## ", ""), pageWidth); 
                doc.text(wrappedText, margin, cursorY);
                cursorY += 7;
              } else if (line.startsWith("### ")) {
              
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 89, 152); 
                cursorY += 5;
                const wrappedText = doc.splitTextToSize(line.replace("### ", ""), pageWidth); 
                doc.text(wrappedText, margin, cursorY);
                cursorY += 5;
              } else if (line.startsWith(">")) {
             
                doc.setFontSize(12);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(46, 52, 64); 
                const wrappedText = doc.splitTextToSize(line.replace(">", ""), pageWidth - 10); 
                doc.text(wrappedText, margin + 10, cursorY);
                cursorY += wrappedText.length * 8; 
              } else if (line.startsWith("```")) {
               
                doc.setFontSize(12);
                doc.setFont("courier");
                doc.setTextColor(44, 62, 80); 
                cursorY += 5;
                const wrappedText = doc.splitTextToSize(line.replace("```", ""), pageWidth - 10); 
                doc.text(wrappedText, margin + 10, cursorY);
                cursorY += wrappedText.length * 8; 
              } else if (line.startsWith("- ")) {
               
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(85, 85, 85); 
                const wrappedText = doc.splitTextToSize("• " + line.replace("- ", ""), pageWidth - 10); 
                doc.text(wrappedText, margin + 10, cursorY);
                cursorY += wrappedText.length * 8; 
              } else {
               
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(85, 85, 85);
                const wrappedText = doc.splitTextToSize(line, pageWidth); 
                doc.text(wrappedText, margin, cursorY);
                cursorY += wrappedText.length * 8; 
              }

              
              if (cursorY > pageHeight - 20) {
                addPageNumber();
                doc.addPage();
                pageNumber++;
                cursorY = 55;
                addHeader();
              }
            });
          };

          addHeader();
          addContent(cleanedText);
          addPageNumber();

          const pdfBlob = doc.output("blob");
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
          };
          reader.readAsDataURL(pdfBlob);
        };

        img.onerror = (error) => {
          reject(new Error("Failed to load logo image"));
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const checkUrlMatch = (userInput, botResponse) => {
    const extractedUrl = extractUrlFromInput(userInput);
    if (!extractedUrl) return false;

    const sanitizedUrl = extractedUrl
      .replace(/https?:\/\//, "")
      .replace(/\/$/, "")
      .split("#")[0]
      .toLowerCase();

    const sanitizedResponse = botResponse.toLowerCase();

    return sanitizedResponse.includes(sanitizedUrl);
  };

  const fetchUserReports = async () => {
    setIsLoadingReports(true);
    try {
      const userEmail = localStorage.getItem("email");
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/get-reports`,
        { email: userEmail }

      );

      if (response.data.status && response.data.reports) {
        setReports(response.data.reports);
        console.log(response);
        setShowReportsModal(true);
      } else {
        alert("No reports found");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to fetch reports");
    } finally {
      setIsLoadingReports(false);
    }
  };


  const generateAndDownloadPDF = async (responseText) => {
    try {
      const pdfBase64 = await generatePDFReport(responseText);
      setPdfData(pdfBase64);
      setShowFilenameModal(true); 

      
      const handleDownload = () => {
        const link = document.createElement("a");
        link.href = pdfBase64;
        link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
        link.click();
        setShowFilenameModal(false);

     
        uploadReportToDatabase(pdfBase64, filename);
      };

     
      const downloadButton = document.querySelector(".download-btn");
      if (downloadButton) {
        downloadButton.onclick = handleDownload;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF.");
    }
  };

  const handleSuggestedInput = (prompt) => {
    setInput(prompt);
    setSuggestivePrompts([]);
  };

  const fetchSuggestivePrompts = async (sessionId) => {
    if (!sessionId) return;

    setIsLoadingSuggestions(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/chat/suggestive-prompt/${sessionId}`,
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.status === "success") {
        setSuggestivePrompts(response.data.data);
      } else {
        setSuggestivePrompts([]);
      }
    } catch (error) {
      console.error("Error fetching suggestive prompts:", error);
      setSuggestivePrompts([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSend = async () => {
    if (input.trim()) {

      const extractedUrl = extractUrlFromInput(input);
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: input,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          sender: "bot",
          text: "Analyzing...",
          timestamp: new Date().toLocaleTimeString(),
          isLoading: true,
        },
      ]);

      setSuggestivePrompts([]);
      setInput("");

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      try {
        const token = localStorage.getItem("token");
        const endpoint = sessionId
          ? `${process.env.REACT_APP_API_URL}/chat/${sessionId}`
          : `${process.env.REACT_APP_API_URL}/chat/first-message`;

        const response = await axios.post(
          endpoint,
          { userPrompt: input.trim() },
          { headers: { token: `${token}` } }
        );

        if (response) {
          handleHistory();
        }
        if (!sessionId) {
          setSessionId(response.data.session.session_id);
        }

        const botResponse = response.data.session.response;
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isLoading),
          {
            sender: "bot",
            text: botResponse,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        setTimeout(() => {
          if (extractedUrl) {
            checkUrlAndGeneratePDF(botResponse, extractedUrl);
          }
        }, 500);

      } catch (error) {
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isLoading),
          {
            sender: "bot",
            text: "I'm sorry, something went wrong while fetching the response.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } finally {
        setIsLoadingBotResponse(false);
      }
    }
  };

  const handleFileUpload = (event) => {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `Uploaded file: ${fileName}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleChatHistoryClick = async (sessionId) => {
    try {

      setActiveComponent("chat");
      setSessionId(sessionId);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/chat/${sessionId}`,
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

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat`, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.sessions) {
        const sortedSessions = response.data.sessions
          .map((session) => ({
            id: session.session_id,
            name: session.chat_name || `Chat ${session.session_id}`,
          }));

        setChatHistory(sortedSessions);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) { }
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleClickPasswordChange = () => {
    setOpenChangePassword(!openChangePassword);
  };

  const handleClickUpdate = () => {
    setOpenUserUpdate(!openUserUpdate);
  };

  const handleChatRename = async (sessionId, newName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/chat/${sessionId}/rename`,
        { new_chat_name: newName },
        {
          headers: {
            Authorization: token,
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

  const handleChatSummarize = async (sessionId) => {
    try {
      setIsLoading(true); 
      setShowUserMenu(null); 

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/chat/summarize/${sessionId}`,
        { headers: { Authorization: token } }
      );

      if (response.data.status === "success") {
        const summaryText = response.data.data;

        // Generate and download the PDF
        const pdfBase64 = await generatePDFReport(summaryText);
        const link = document.createElement("a");
        link.href = pdfBase64;
        link.download = "Chat_Summary.pdf";
        link.click();

       
        setIsPopupVisible(true);

       
        setTimeout(() => setIsPopupVisible(false), 3000);
      } else {
        alert("Failed to summarize chat. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching chat summary:", error);
      alert("An error occurred while summarizing the chat.");
    } finally {
      setIsLoading(false); 
    }
  };






  const handleClickDelete = () => {
    setOpenDelete(!openDelete);
  };

  const handleChatDelete = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/chat/delete`,
        { session_id: sessionId },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.data.status === "success") {
        handleHistory();
        newchatHandler();
      } else {
        throw new Error(response.data.message || "Failed to delete chat");
      }
    } catch (error) {
      alert("Failed to delete chat. Please try again.");
    }
  };

  const handleChatAction = async (action, chatId) => {
    switch (action) {
      case "rename":
        const newName = prompt("Enter new chat name:");
        if (newName) handleChatRename(chatId, newName);
        break;
      case "delete":
        if (chatId) handleChatDelete(chatId);
        break;
      case "summarize":
        if (chatId) handleChatSummarize(chatId);
        break;
      default:
    }

    setShowUserMenu(null);
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
    setSuggestivePrompts([]);
    setActiveComponent("chat");
  };

  const cveHandler = () => {
    setActiveComponent("cve");
  }

  return (
    <div className="chatbot-wrapper">

      {/* Add the loading overlay here */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generating Summary...</p>
        </div>
      )}
      {isPopupVisible && (
        <div className="popup-notification">
          <p>Your chat summary has been downloaded!</p>
        </div>
      )}

      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <img src={astraLogo} alt="Astra Logo" className="sidebar-logo" />
        </div>
        <div className="sidebar-actions">
          <button className="action-btn new-chat-btn" onClick={newchatHandler}>
            <FaPlus /> New Chat
          </button>
          <button className="action-btn marketplace-btn" onClick={fetchUserReports}>
            <FaRegFileAlt /> Reports
          </button>
          <button className="action-btn cve-fetch-btn" onClick={cveHandler}>
            <FaBug /> Latest CVEs
          </button>
          <button className={`action-btn feature-btn ${showFeaturesDropdown ? "open" : ""}`}
            onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}>
            <FaToolbox /> Features
          </button>


          {showFeaturesDropdown && (
            <div className="features-dropdown">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="dropdown-item-feature"
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  {feature.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="chat-history-section">
          <div className="chat-history-header">Chat History</div>
          <div className="chat-history">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => handleChatHistoryClick(chat.id)}
              >
                <span>{chat.name}</span>

                <div className="chat-actions">
                  <FaEllipsisV
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(chat.id);
                    }}
                  />
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
                        className="dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatAction("summarize", chat.id);
                        }}
                      >
                        <span className="dropdown-icon">
                          <FaRegFileAlt />
                        </span>
                        <span className="dropdown-text">Summarize</span>
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
            <button
              onClick={() => setRunTour(true)}
              className="tour-button"
              aria-label="Take a Tour"
            >
              <FaQuestionCircle />
            </button>
            <button
              onClick={handleToggleTheme}
              className="theme-toggle"
              aria-label="Toggle Theme"
            >
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
                  name={`${localStorage.getItem("fname") || "User"} ${localStorage.getItem("lname") || "Name"
                    }`}
                  size="50"
                  round={true}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ cursor: "pointer" }}
                />
              )}
              {showProfileDropdown && (
                <div
                  className="dropdown profile-dropdown"
                  ref={profileDropdownRef}
                >
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

        {activeComponent === "chat" ? (
          <>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <div className={`message ${msg.sender}`}>
                    {/* Astra Avatar for Bot Messages */}
                    {msg.sender === "bot" && (
                      <img
                        src={astraAvatar}
                        alt="Bot Avatar"
                        className="message-avatar"
                      />
                    )}
                    {/* Bot Message or Analyzing Loader */}
                    <div
                      className={`message-text ${msg.isLoading ? "loading-indicator" : ""
                        }`}
                    >
                      {msg.isLoading ? (
                        <div className="loading-text-chatbot">
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
                        >
                          {typeof msg.text === "string"
                            ? msg.text
                            : JSON.stringify(msg.text)}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>

                  {msg.sender === "bot" &&
                    index === messages.length - 1 &&
                    !msg.isLoading &&
                    checkUrlMatch(input, msg.text) && (
                      <button
                        className="download-report-btn"
                        onClick={() => generateAndDownloadPDF(msg.text)}
                      >
                        Download Report
                      </button>
                    )}



                  {/* Loader or Suggestive Prompts for the Latest Bot Message */}
                  {msg.sender === "bot" && index === messages.length - 1 && (
                    <div className="message bot">
                      {/* Astra Avatar */}
                      {isLoadingSuggestions && (
                        <img
                          src={astraAvatar}
                          alt="Bot Avatar"
                          className="message-avatar"
                        />
                      )}

                      {/* Loader or Suggestive Inputs */}
                      <div>
                        {isLoadingSuggestions ? (
                          <div className="loading-text-chatbot">
                            <span>Suggesting</span>
                            <span className="dot-animation">
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
                          </div>
                        ) : (
                          <div className="suggestive-prompts no-avatar">
                            {suggestivePrompts.map((prompt, promptIndex) => (
                              <button
                                key={promptIndex}
                                className="suggestion-btn"
                                onClick={() => handleSuggestedInput(cleanMarkdownText(prompt))}
                              >
                                {cleanMarkdownText(prompt)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {showFilenameModal && (
                <div className="filename-modal-overlay">
                  <div className="filename-modal">
                    <h3>Save Report</h3>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="Enter filename"
                    />
                    <div className="modal-buttons">
                      <button
                        className="download-btn"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = pdfData;
                          link.download = filename.endsWith(".pdf")
                            ? filename
                            : `${filename}.pdf`;
                          link.click();
                          setShowFilenameModal(false);
                          uploadReportToDatabase(pdfData, filename);
                        }}
                      >
                        Download
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setShowFilenameModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <button className="microphone-button" onClick={handleToggleListening}>
                {listening ? (
                  <i className="fa-solid fa-circle-pause"></i>
                ) : (
                  <i className="fa-solid fa-microphone"></i>
                )}
              </button>
              <button onClick={handleSend} className="send-button">
                <LuSend />
              </button>
            </div>
          </>
        ) : (
          <CveTable />
        )}

        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          styles={{
            options: {
              primaryColor: '#9D4EDD',
              textColor: '#FFFFFF',
              backgroundColor: '#1E1E1E',
            },
            buttonPrimary: {
              backgroundColor: '#9D4EDD',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
            },
            buttonSkip: {
              backgroundColor: 'transparent',
              color: '#9D4EDD',
              fontWeight: 'bold',
            },
          }}
        />


      </div>
      {openUserUpdate && <UserUpdate closeModal={setOpenUserUpdate} />}
      {openChangePassword && (
        <ChangePassword closeModal={setOpenChangePassword} />
      )}
      {openDelete && <DeleteAccount onCancel={setOpenDelete} />}

      {showReportsModal && <ReportsModal />}
    </div>
  );
};

export default Chatbot;
