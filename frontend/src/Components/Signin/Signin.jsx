import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextRevealCard } from "../ui/text-reveal-card.jsx"; // Import your TextRevealCard component
import "./Signin.css";
import { signin } from "./Services/SigninServices.jsx";
import Notification from "../Common/Notification/Notification.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";

function SignIn({ onOpenChatbot }) {
  const alert = new Notification(); // Notification instance

  const [data, setData] = useState({ email: "", pass: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const subHandler = async (e) => {
    e.preventDefault();

    const isLoggedin = await signin(data); // Call the API
    if (isLoggedin?.status) {
      alert.notify(isLoggedin?.status, isLoggedin?.message); // Notify success
      setData({ email: "", pass: "" }); // Reset form fields
      localStorage.setItem("token", isLoggedin?.data); // Save token in localStorage

      onOpenChatbot(); // Open the chatbot window
    } else {
      alert.notify(isLoggedin?.status, isLoggedin?.message); // Notify error
    }
  };

  // Handle input changes
  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="signin-page">
      {/* Left Section */}
      <div className="left-section">
        <div className="signin-branding">
          <TextRevealCard
            text="Welcome back!" // Text for the animation
            revealText="Sign in to continue your secure journey." // Subtitle
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Sign In</h2>
          <form onSubmit={subHandler}>
            <input
              type="email"
              placeholder="E-mail"
              required
              name="email"
              value={data.email}
              onChange={changeHandler}
            />
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                name="pass"
                value={data.pass}
                onChange={changeHandler}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <LuEyeClosed /> : <FaEye />}
              </span>
            </div>
            <button type="submit" className="shimmer-btn">
              Sign In
            </button>
          </form>
          <p>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#9D4EDD",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
