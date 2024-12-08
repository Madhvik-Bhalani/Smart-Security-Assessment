import React from "react";
import "./Signin.css";
import { Link } from "react-router-dom";

function Signin() {
  return (
    <div className="signin-login-page">
      {/* Left Section */}
      <div className="signin-left-section">
        <div className="signin-branding">
          <h1>Boundless Security, Infinite Trust</h1>
          <p>Join us to secure your website!</p>
        </div>
        <div className="signin-testimonial">
          <p>
            "Security is a journey, not a destination. It is an ongoing process
            of vigilance, improvement, and adaptation to ever-changing threats.
            True security comes from not just protecting against known risks but
            anticipating and preparing for the unknown."
          </p>
          <p>— Bruce Schneier, Security Technologist and Author</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="signin-right-section">
        <div className="signin-form-container">
          <h2>Login to Your Account</h2>
          <form>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="signin-submit-btn">
              Login
            </button>
            <p>
              Don't have an account? <Link to="/Signup">Register Here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signin;
