import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Signin from "./Components/Signin/Signin";
import Chatbot from "./Components/Chatbot/Chatbot";
import Home from "./Components/Home/Home";
import { ToastContainer } from 'react-toastify';


function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Chatbot state

  // Function to open the chatbot
  const openChatbot = () => {
    setIsChatbotOpen(true);
  };

  // Function to close the chatbot
  const closeChatbot = () => {
    setIsChatbotOpen(false);
  };

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/signin"
          element={<Signin onOpenChatbot={openChatbot} />}
        />
      </Routes>

      {/* Render the Chatbot directly if open */}
      {isChatbotOpen && <Chatbot onClose={closeChatbot} />}
      <ToastContainer limit={3} />
    </BrowserRouter>
  );
}

export default App;
