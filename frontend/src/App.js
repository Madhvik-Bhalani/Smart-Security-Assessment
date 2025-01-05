import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Signin from "./Components/Signin/Signin";
import Chatpage from "./Components/Chatbot/Chatbot";
import Home from "./Components/Home/Home";
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import InvalidRoute from "./Components/InvalidRoute/InvalidRoute";

function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/signin"
          element={<Signin />}
        />
        <Route path="/chat" element={<ProtectedRoute element={<Chatpage />} />} />

        <Route path="*" element={<InvalidRoute />} />
      </Routes>


      <ToastContainer limit={3} />
    </BrowserRouter>
  );
}

export default App;
