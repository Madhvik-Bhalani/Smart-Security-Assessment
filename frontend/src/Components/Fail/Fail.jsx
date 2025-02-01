import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./fail.css"

const PaymentFailPage = () => {
    const navigate = useNavigate()
  return (
    <div className="payment-fail-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }} 
        className="fail-container"
      >
        <XCircle className="icon" size={64} />
        <h1 className="title">Payment Failed</h1>
        <p className="message">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        <button className="retry-button" onClick={() => navigate("/")}>Back to Homepage</button>
      </motion.div>
    </div>
  );
};

export default PaymentFailPage;
