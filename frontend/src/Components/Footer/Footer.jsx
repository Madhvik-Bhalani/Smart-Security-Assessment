import React from "react";
import "./Footer.css";
import { FaLinkedin, FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-section">
      {/* Branding */}
      <div className="footer-branding">
        <h1 className="footer-logo">ASTRA</h1>
        <p>Your cybersecurity companion, ensuring trust and protection.</p>
      </div>

      {/* Navigation Links */}
      <div className="footer-links">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="/Privacy">Privacy Policy</a>
        <a href="/Terms">Terms of Service</a>
        <a href="/GDPR">GDPR</a>
      </div>

      {/* Contact Information */}
      <div className="footer-contact">
        <p>Email: <a href="mailto:contact@astra.com">info.codefinity@gmail.com</a></p>
      </div>

      {/* Social Media Links */}
      <div className="footer-social">
        <a href="https://www.linkedin.com/company/team-codefinity/" target="_blank" rel="noreferrer">
          <FaLinkedin className="social-icon" />
        </a>
        <a href="https://x.com/Team_Codefinity" target="_blank" rel="noreferrer">
          <FaTwitter className="social-icon" />
        </a>
        <a href="https://www.instagram.com/team_codefinity_5/" target="_blank" rel="noreferrer">
          <FaInstagram className="social-icon" />
        </a>
        <a href="https://team-codefinity.vercel.app/" target="_blank" rel="noreferrer">
          <FaGlobe className="social-icon" />
        </a>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} Astra. All Rights Reserved.</p>
        <p>DISCLAIMER: This website does not belong to a real company. It is a Planspiel Web Engineering project at the Technical University of Chemnitz.</p>
      </div>
    </footer>
  );
};

export default Footer;
