import React from 'react';
import { motion } from 'framer-motion';
import './Astra.css';

const Astra = ({ refAstra, videoRef, astraVideo, typedText, handleTalkToAstra }) => {
  return (
    <motion.div
      className="astra-section"
      id="astra"
      ref={refAstra}
      initial={{ opacity: 0, y: 50 }} // Start hidden and slightly below
      whileInView={{ opacity: 1, y: 0 }} // Animate to visible position
      viewport={{ once: true, amount: 0.5 }} // Trigger animation every time in view
      transition={{ duration: 0.8, ease: "easeOut" }}
    >

      {/* Heading */}
      <motion.h2
        className="astra-heading text-purple-400"
        initial={{ opacity: 0, y: 50 }} // Start hidden and below
        whileInView={{ opacity: 1, y: 0 }} // Animate to visible
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Meet Astra
      </motion.h2>

      {/* Content */}
      <div className="astra-content">
        {/* Video Wrapper */}
        <motion.div
          className="astra-video-wrapper"
          initial={{ opacity: 0, y: 50 }} // Slide in from bottom
          whileInView={{ opacity: 1, y: 0 }} // Animate to position
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <video
            ref={videoRef}
            muted
            className="astra-video"
            disablePictureInPicture
            controlsList="nodownload"
          >
            <source src={astraVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* Text */}
        <motion.div
          className="astra-text"
          initial={{ opacity: 0, y: 50 }} // Slide in from bottom
          whileInView={{ opacity: 1, y: 0 }} // Animate to position
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <p>{typedText}</p>
        </motion.div>
      </div>

      {/* Button */}
      <motion.button
        className="talk-btn"
        onClick={handleTalkToAstra}
        initial={{ opacity: 0, y: 50 }} // Start hidden and below
        whileInView={{ opacity: 1, y: 0 }} // Animate to visible
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        whileHover={{ scale: 1.1 }} // Slightly enlarge on hover
        whileTap={{ scale: 0.9 }} // Shrink slightly on tap
      >
        Talk to Astra
      </motion.button>
    </motion.div>
  );
};

export default Astra;
