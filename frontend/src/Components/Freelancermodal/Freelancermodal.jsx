import React from "react";
import "./Freelancermodal.css";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

const FreelancerModal = ({ freelancer, onClose }) => {
  if (!freelancer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <img src={freelancer.image} alt={freelancer.name} />
        <h2>{freelancer.name}</h2>
        <p>{freelancer.role}</p>
        <div className="price">${freelancer.price}/hr</div>
        <p>{freelancer.summary}</p>
        
        <ul className="skills">
          {freelancer.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <div className="social-links">
          {freelancer.socialMedia.linkedin && (
            <a
              href={freelancer.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin size={24} />
            </a>
          )}
          {freelancer.socialMedia.twitter && (
            <a
              href={freelancer.socialMedia.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter size={24} />
            </a>
          )}
          {freelancer.socialMedia.github && (
            <a
              href={freelancer.socialMedia.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={24} />
            </a>
          )}
        </div>
        <a href={`mailto:${freelancer.email}`}>Email: {freelancer.email}</a>
      </div>
    </div>
  );
};

export default FreelancerModal;
