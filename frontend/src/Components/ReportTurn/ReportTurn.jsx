import React from "react";
import HTMLFlipBook from "react-pageflip";
import { motion } from "framer-motion";
import "./ReportTurn.css";
import cover from "../../assets/Report1.jpg";
import page2 from "../../assets/Report2.jpg";
import page3 from "../../assets/Report3.jpg";
import page4 from "../../assets/Report4.jpg";
import page5 from "../../assets/Report5.jpg";
import page6 from "../../assets/Report6.jpg";
import page7 from "../../assets/Report7.jpg";
import page8 from "../../assets/Report8.jpg";
import page9 from "../../assets/Report9.jpg";

const pages = [cover, page2, page3, page4, page5, page6, page7, page8, page9];

const ReportTurn = () => {
  return (
    <div className="report-turn-container">
      <motion.h2
        className="report-turn-heading"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Report Overview
      </motion.h2>
      <div className="report-wrapper">
        {/* Left-hand text */}
        <motion.div
          className="explore-text"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          "Dive into the comprehensive report to discover key insights and valuable details!"
        </motion.div>
        {/* Flipbook */}
        <HTMLFlipBook
          width={500}
          height={703}
          className="report-turn-book"
          showCover={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
        >
          {pages.map((page, index) => (
            <div key={index} className="report-turn-page">
              <img src={page} loading="lazy" alt={`Report page ${index + 1}`} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
};

export default ReportTurn;
