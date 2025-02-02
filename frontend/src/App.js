import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Components/Signup/Signup";
import Signin from "./Components/Signin/Signin";
import Chatpage from "./Components/Chatbot/Chatbot";
import Home from "./Components/Home/Home";
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import InvalidRoute from "./Components/InvalidRoute/InvalidRoute";
import User from "./Components/User/User"
import UserUpdate from "./Components/UserUpdate/UserUpdate"
import ChangePassword from "./Components/ChangePassword/ChangePassword"
import Pricing from "./Components/Pricing/Pricing";
import PaymentSuccessPage from "./Components/Success/Success";
import Fail from "./Components/Fail/Fail"

import { jwtDecode } from "jwt-decode";

function App() {


  const isAuthenticated = () => {
    const token = localStorage.getItem("token");

    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000; // Check if token is still valid
    } catch (error) {
      return false; // Invalid token
    }
  };

  return (

    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* Redirect / to /chat if the user is authenticated */}
        <Route path="/" element={isAuthenticated() ? <Navigate to="/chat" replace /> : <Home />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/update" element={<UserUpdate />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/success" element={<PaymentSuccessPage />} />
        <Route path="/fail" element={<Fail />} />
        <Route path="/subscription" element={<Pricing />} />

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
