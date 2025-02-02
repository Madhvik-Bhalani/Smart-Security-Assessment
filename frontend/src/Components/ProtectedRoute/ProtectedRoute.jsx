import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../Common/Notification/Notification";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const alert = new Notification();

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // Current time in seconds
      return decoded.exp < now;
    } catch (error) {
      return true; // Treat invalid token as expired
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        if (isTokenExpired(token)) {
          alert.notify(false, "Session expired! Please login again.");
          localStorage.removeItem("token"); // Remove expired token
          navigate("/signin");
        }
      } catch (error) {
        alert.notify(false, "Invalid token! Please login again.");
        localStorage.removeItem("token"); // Remove invalid token
        navigate("/signin");
      }
    } else {
      alert.notify(false, "Access denied! Please login to continue.");
      navigate("/signin");
    }
  }, [alert, navigate]);

  // If token is valid, render the protected element
  return element;
};

export default ProtectedRoute;
