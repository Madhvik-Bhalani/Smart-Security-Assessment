import React, { useState } from "react";
import {
  FaShieldAlt,
  FaLock,
  FaCreditCard,
  FaUserShield,
  FaClipboardList,
  FaCertificate,
  FaKey,
  FaServer,
  FaArrowLeft
} from "react-icons/fa";
import "./SecurityStandards.css";
import AstraLogo from "../../assets/Astrap_nobg.png";
import { useNavigate } from "react-router-dom";

const standards = [
  {
    id: 1,
    info: "Healthcare",
    icon: <FaClipboardList />,
    shortForm: "HIPAA",
    description:
      "HIPAA ensures national standards for healthcare information protection, including sensitive patient health data. Healthcare providers and related entities must comply with safeguards to protect patient confidentiality.",
  },
  {
    id: 2,
    info: "Data Protection",
    icon: <FaShieldAlt />,
    shortForm: "GDPR",
    description:
      "GDPR mandates personal data protection and privacy for EU citizens, ensuring transparency and control over their data. Organizations must follow strict data management policies to avoid penalties.",
  },
  {
    id: 3,
    info: "Payment Security",
    icon: <FaCreditCard />,
    shortForm: "PCI DSS",
    description:
      "PCI DSS outlines security standards for credit card transactions, emphasizing secure payment data storage, processing, and transmission to reduce risks of financial breaches.",
  },
  {
    id: 4,
    info: "Information Security",
    icon: <FaLock />,
    shortForm: "ISO 27001",
    description:
      "ISO 27001 provides a framework for information security management systems (ISMS), focusing on securing organizational data and mitigating information risks.",
  },
  {
    id: 5,
    info: "Customer Data",
    icon: <FaServer />,
    shortForm: "SOC 2",
    description:
      "SOC 2 ensures secure management of customer data through principles such as security, availability, processing integrity, and confidentiality for SaaS providers.",
  },
  {
    id: 6,
    info: "Cybersecurity Framework",
    icon: <FaKey />,
    shortForm: "NIST",
    description:
      "The NIST Cybersecurity Framework helps organizations enhance cybersecurity practices, focusing on identifying, protecting, detecting, responding to, and recovering from cyber threats.",
  },
  {
    id: 7,
    info: "IT Governance",
    icon: <FaCertificate />,
    shortForm: "COBIT",
    description:
      "COBIT provides a governance framework for IT systems to align technical capabilities with business objectives, ensuring efficient resource utilization and regulatory compliance.",
  },
  {
    id: 8,
    info: "Identity Management",
    icon: <FaUserShield />,
    shortForm: "IAM",
    description:
      "IAM provides secure digital identity frameworks, ensuring authorized access to organizational resources based on user roles and policies.",
  },
];

const SecurityStandards = () => {
  const [matches, setMatches] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const handleDrop = (draggedId, droppedId) => {
    const draggedStandard = standards.find((item) => item.id === draggedId);
    const droppedStandard = standards.find((item) => item.shortForm === droppedId);

    if (draggedStandard && droppedStandard && draggedStandard.id === droppedStandard.id) {
      const newMatches = [...matches, draggedStandard];
      setMatches(newMatches);

      if (newMatches.length === standards.length) {
        setIsCompleted(true);
      }
    }
  };

  const handleCloseModal = () => setSelectedStandard(null);

  const renderDragItem = (item) => {
    const isMatched = matches.find((match) => match.id === item.id);
    return !isMatched ? (
      <div
        key={item.id}
        className="drag-item"
        draggable
        onDragStart={(e) => e.dataTransfer.setData("draggedId", item.id)}
      >
        <span className="icon">{item.icon}</span>
        <span>{item.info}</span>
      </div>
    ) : null;
  };

  const renderDropZone = (item) => {
    const isMatched = matches.find((match) => match.id === item.id);
    return !isMatched ? (
      <div
        key={item.id}
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(Number(e.dataTransfer.getData("draggedId")), item.shortForm)}
      >
        {item.shortForm}
      </div>
    ) : null;
  };

  return (
    <div className="infographic-page">

      {/* Astra Logo */}
      <img src={AstraLogo} alt="Astra Logo" className="astra-logo" />

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back to Astra
      </button>

      <header className="infographic-header">
        <h1>Explore Security Standards</h1>
        <p>Drag and drop the icons to the correct short form to learn more about each security standard.</p>
      </header>
      <div className="matched-items">
        {matches.map((match, index) => (
          <div
            key={index}
            className="matched-item"
            onClick={() => setSelectedStandard(match)}
          >
            <span className="icon">{match.icon}</span>
            <span>{match.info} - {match.shortForm}</span>
          </div>
        ))}
      </div>
      {!isCompleted && (
        <div className="drag-drop-container">
          <div className="drag-items">
            {standards.map((item) => renderDragItem(item))}
          </div>
          <div className="drop-zones">
            {standards.map((item) => renderDropZone(item))}
          </div>
        </div>
      )}
      {isCompleted && (
        <div className="completion-message">
          <h2>
            In order to get more information about these standards and gain insights
            on how to make your website compliant, please talk to Astra.
          </h2>
          <p>For more information, please visit the official links:</p>
          <ul>
            <li><a href="https://www.hhs.gov/hipaa/index.html" target="_blank" rel="noopener noreferrer">HIPAA Official Website</a></li>
            <li><a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer">GDPR Official Website</a></li>
            <li><a href="https://www.pcisecuritystandards.org/" target="_blank" rel="noopener noreferrer">PCI DSS Official Website</a></li>
            <li><a href="https://csrc.nist.gov/" target="_blank" rel="noopener noreferrer">NIST Official Website</a></li>
            <li><a href="https://www.iso.org/isoiec-27001-information-security.html" target="_blank" rel="noopener noreferrer">ISO 27001 Official Website</a></li>
          </ul>
        </div>
      )}
      {selectedStandard && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={handleCloseModal}>
              ✕
            </span>
            <h2>{selectedStandard.info} ({selectedStandard.shortForm})</h2>
            <p>{selectedStandard.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityStandards;
