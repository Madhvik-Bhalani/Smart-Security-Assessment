import React from "react";
import "./Newsletter.css";
import { motion } from "framer-motion";
import image1 from "../../assets/NL1.jpg";
import image2 from "../../assets/NL2.jpg";
import image3 from "../../assets/NL3.jpg";
import image4 from "../../assets/NL4.jpg";

const cards = [
  {
    image: image1,
    title: "Introduction to Astra: Your Cybersecurity Companion",
    link: "Learn More",
  },
  {
    image: image2,
    title: "CVE Spotlight: Vulnerabilities You Should Know",
    link: "Explore Now",
  },
  {
    image: image3,
    title: "Types of Cybersecurity Vulnerabilities Explained",
    link: "Read More",
  },
  {
    image: image4,
    title: "Weekly Cybersecurity Insights: Trends and Best Practices",
    link: "Discover More",
  },
];

const Newsletter = ({ refNewsletter }) => {
  return (
    <div className="newsletter-section" id="newsletter" ref={refNewsletter}>
      {/* Heading Animation */}
      <motion.h2
        className="newsletter-heading"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Newsletter Sneak Peek
      </motion.h2>

      {/* Cards Animation */}
      <div className="newsletter-landing-cards">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="newsletter-landing-card"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: index * 0.2,
            }}
          >
            <img
              src={card.image}
              alt={card.title}
              className="newsletter-landing-image"
            />
            <div className="newsletter-overlay">
              <h3 className="newsletter-title">{card.title}</h3>
              <a href="#read-more" className="read-more">
                {card.link}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Newsletter;
