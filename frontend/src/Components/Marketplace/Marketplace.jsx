import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Marketplace.css";
import Freelancermodal from "../Freelancermodal/Freelancermodal";
import { FaArrowLeft } from "react-icons/fa";
import Ashish from "../../assets/Ashish.jpeg";
import Niraj from "../../assets/Niraj.jpeg";
import Vibhum from "../../assets/Vibhum.jpeg";
import AstraLogo from "../../assets/Astrap_nobg.png";

const freelancers = [
  {
    id: 1,
    name: "Ashish Dhone",
    role: "Cybersecurity Expert",
    summary: "Globally recognized ethical hacker ranked among the top in the world, awarded Best Bug Hunter by Microsoft (MVR 2023 & 2024), Apple (2022), and Google (2021), as well as over 300 Fortune 500 companies. Certified and experienced in advanced penetration testing, exploit development, and vulnerability research with 4 CVEs to credit. Passionate CTF player, accomplished public speaker, and advocate for cybersecurity awareness..",
    skills: ["Advanced Pen Testing", "Bug Bounty Hunting", "CVE Discovery", "Digital Forensics", "Ethical Hacking"],
    email: "info.codefinity@gmail.com",
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/ashketchumwashere/",
    },
    image: Ashish,
    price: 50,
  },
  {
    id: 2,
    name: "Niraj Mahajan",
    role: "Cybersecurity Expert",
    summary: "Accomplished security professional recognized as a Microsoft 2024 Most Valuable Researcher (MVR), experienced Bug Bounty Hunter, and skilled Penetration Tester. Specialized in Application Security and vulnerability research, with a proven track record of discovering 11 CVEs and enhancing software security.",
    skills: ["Bug Bounty Hunting", "Network Security", "Security Incident Management", "Application Security"],
    email: "info.codefinity@gmail.com",
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/niraj1mahajan/",
    },
    image: Niraj,
    price: 50,
  },
  {
    id: 3,
    name: "Vibhum Dubey",
    role: "Cybersecurity Expert",
    summary: "Experienced Lead Information Security Analyst specializing in Vulnerability Assessment, Penetration Testing, and Cyber Threat Hunting. Skilled in Advanced Threat Analytics, Red Team operations, and implementing robust security measures to mitigate risks and safeguard systems.",
    skills: ["Cyber Threat Hunting", "Threat Intelligence", "Vulnerability Assessment", "Threat Intelligence"],
    email: "info.codefinity@gmail.com",
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/vibhum/",
    },
    image: Vibhum,
    price: 50,
  },
];

const freelancingWebsites = [
  { name: "Upwork", url: "https://www.upwork.com/nx/search/talent/?nbs=1&q=cyber%20security%20expert" },
  { name: "Fiverr", url: "https://www.fiverr.com/search/gigs?query=cybersecurity" },
  { name: "Toptal", url: "https://www.toptal.com/freelancers/cybersecurity" },
  { name: "Freelancer", url: "https://www.freelancer.com/job-search/cyber-security-freelancers/" },
  { name: "Guru", url: "https://www.toptal.com/security-engineers" },
];

const Marketplace = () => {
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
  };

  const handleCloseModal = () => {
    setSelectedFreelancer(null);
  };

  return (
    <div className="marketplace-container">
      {/* Astra Logo */}
      <img src={AstraLogo} alt="Astra Logo" className="astra-logo" />

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="back-icon" /> Back to Astra
      </button>

      {/* Marketplace Heading */}
      <h2 className="marketplace-heading">Our Cybersecurity Experts</h2>
      <p className="marketplace-description">
        Browse our talented experts and secure your website today.
      </p>

      {/* Freelancer Grid */}
      <div className="freelancers-grid">
        {freelancers.map((freelancer) => (
          <div key={freelancer.id} className="freelancer-card" onClick={() => handleCardClick(freelancer)}>
            <img className="freelancer-image" src={freelancer.image} alt={freelancer.name} />
            <h3 className="freelancer-name">{freelancer.name}</h3>
            <p className="freelancer-role">{freelancer.role}</p>
            <div className="freelancer-price">${freelancer.price}/hr</div>
            <button className="view-more-button">View More</button>
          </div>
        ))}
      </div>

      {/* Freelancer Modal */}
      <Freelancermodal freelancer={selectedFreelancer} onClose={handleCloseModal} />

      {/* Alternative Freelancing Platforms */}
      <div className="alternative-platforms-container">
        <h3 className="alternative-platforms-heading">Not finding the right fit?</h3>
        <p className="alternative-platforms-message">
          If you'd like to explore more options beyond our experts, check out these platforms to find top cybersecurity professionals.
        </p>
        <div className="alternative-platforms-buttons">
          {freelancingWebsites.map((site, index) => (
            <a key={index} href={site.url} target="_blank" rel="noopener noreferrer" className="platform-button">
              {site.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
