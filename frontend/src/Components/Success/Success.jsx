import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import "./success.css"
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage = () => {
    const navigate = useNavigate()
  return (
    <div className="payment-success-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }} 
        className="success-container"
      >
        <CheckCircle className="success-icon" size={64} />
        <h1 className="title">Payment Successful!</h1>
        <p className="message">
          Thank you for your payment. Your transaction has been successfully processed.
        </p>
        <button className="continue-button" onClick={() => navigate("/")}>Continue to the Homepage</button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
