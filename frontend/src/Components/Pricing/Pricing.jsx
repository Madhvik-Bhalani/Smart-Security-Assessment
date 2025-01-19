import React from "react";
import { motion } from "framer-motion";
import "./Pricing.css";

const Pricing = ({ refPricing }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="pricing-section" id="pricing" ref={refPricing}>
      <motion.h2
        className="pricing-heading"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Choose your plan
      </motion.h2>
      <motion.p
        className="pricing-subheading"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        Secure your website with ease
      </motion.p>

      <motion.div
        className="pricing-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <motion.div className="pricing-card side" variants={cardVariants}>
          <h3 className="pricing-title">Pay Per Use</h3>
          <p className="pricing-description">
            Detailed cybersecurity report for each request.
          </p>
          <div className="pricing-price">€4</div>
          <button className="pricing-button">Subscribe</button>
          <ul className="pricing-features">
            <li>✔ One report per request</li>
            <li>✔ AI-powered detailed analysis</li>
            <li>✔ Real-time vulnerability detection</li>
          </ul>
        </motion.div>

        <motion.div className="pricing-card center" variants={cardVariants}>
          <h3 className="pricing-title">
            Annual Plan <span className="popular-badge">Best Value</span>
          </h3>
          <p className="pricing-description">
            Comprehensive protection with unlimited reports for a year.
          </p>
          <div className="pricing-price">€150</div>
          <button className="pricing-button">Subscribe</button>
          <ul className="pricing-features">
            <li>✔ Unlimited reports</li>
            <li>✔ Priority support and troubleshooting</li>
            <li>✔ Exclusive access to new features</li>
            <li>✔ Cancel anytime</li>
            <li>✔ Access to curated Newsletters</li>
          </ul>
        </motion.div>

        <motion.div className="pricing-card side" variants={cardVariants}>
          <h3 className="pricing-title">Monthly Plan</h3>
          <p className="pricing-description">
            Unlimited cybersecurity reports every month.
          </p>
          <div className="pricing-price">€15</div>
          <button className="pricing-button">Subscribe</button>
          <ul className="pricing-features">
            <li>✔ 24/7 support for queries</li>
            <li>✔ Personalized security suggestions</li>
            <li>✔ Access to curated Newsletters</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Pricing;
