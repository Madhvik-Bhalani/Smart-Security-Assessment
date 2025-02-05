import React from 'react';
import { motion } from 'framer-motion';
import './USP.css';
import { FaHandshake, FaLaptopCode, FaNewspaper, FaUsers } from 'react-icons/fa';

const USP = ({ refUSPs }) => {
  return (
    <div
      className="usp-section"
      id="usps"
      ref={refUSPs}
    >
      <motion.div
        className="usp-content"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="usp-heading"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Our USPs
        </motion.h2>
        <div className="usp-icons-grid">
          <motion.div
            className="usp-icon-item"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaHandshake className="usp-icon" />
            <h3 className="usp-title">Human-like Assistance, Machine-like Precision</h3>
          </motion.div>
          <motion.div
            className="usp-icon-item"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaLaptopCode className="usp-icon" />
            <h3 className="usp-title">Effortless Ease of Use</h3>
          </motion.div>
          <motion.div
            className="usp-icon-item"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaNewspaper className="usp-icon" />
            <h3 className="usp-title">Curated Cybersecurity Newsletters</h3>
          </motion.div>
          <motion.div
            className="usp-icon-item"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaUsers className="usp-icon" />
            <h3 className="usp-title">Simplicity</h3>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="learn-more-btn-usp"
        >
          Learn More
        </motion.button>
      </motion.div>
    </div>
  );
};

export default USP;
