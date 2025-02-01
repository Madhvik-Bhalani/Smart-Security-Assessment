import React, { useState } from "react";
import "./Marketplace.css";
import Freelancermodal from "../Freelancermodal/Freelancermodal";
import Kalpita from "../../assets/Team_Members/KG.jpg";
import Kunal from "../../assets/Team_Members/KG.jpg";
import Darshan from "../../assets/Team_Members/DD.jpg";

const freelancers = [
  {
    id: 1,
    name: "Kalpita Gawade",
    role: "QA Engineer",
    summary:
      "Experienced Software Engineer and QA Engineer with a demonstrated history of working in the information technology and services industry. Skilled in JavaScript, React.js, and other modern web technologies.",
    skills: ["JavaScript", "React.js", "HTML", "CSS", "TailwindCSS"],
    portfolio: "https://kalpitagawade.com",
    email: "kalpitagawade5@gmail.com",
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/kalpita-gawade/",
      github: "https://github.com/KalpitaG",
    },
    image: Kalpita,
    price: 50,
  },
  {
    id: 2,
    name: "Darshan Dhanani",
    role: "ML/AI Developer",
    summary: "Specializes in building APIs and scalable backend systems.",
    skills: ["Node.js", "Express", "MongoDB", "Docker"],
    portfolio: "https://example.com",
    email: "darshan.dhanani@example.com",
    socialMedia: {
      linkedin: "https://linkedin.com/in/darshan",
      github: "https://github.com/darshan",
    },
    image: Darshan,
    price: 50,
  },
  {
    id: 3,
    name: "Kunal Rokde",
    role: "Software Engineer",
    summary:
      "Experienced Software Engineer with a demonstrated history of working in the information technology and services industry. Skilled in JavaScript, React.js, Node.js, and other modern web technologies.",
    skills: ["JavaScript", "React.js", "Node.js", "HTML", "CSS"],
    portfolio: "https://kunalrokde.com",
    email: "kunal.rokde@example.com",
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/kunal-rokde/",
      github: "https://github.com/example",
    },
    image: Kunal,
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

  const handleCardClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
  };

  const handleCloseModal = () => {
    setSelectedFreelancer(null);
  };

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-heading">Our Cybersecurity Experts</h2>
      <p className="marketplace-description">
        Browse our talented experts and secure your website today.
      </p>
      <div className="freelancers-grid">
        {freelancers.map((freelancer) => (
          <div
            key={freelancer.id}
            className="freelancer-card"
            onClick={() => handleCardClick(freelancer)}
          >
            <img
              className="freelancer-image"
              src={freelancer.image}
              alt={freelancer.name}
            />
            <h3 className="freelancer-name">{freelancer.name}</h3>
            <p className="freelancer-role">{freelancer.role}</p>
            <div className="freelancer-price text-gray-700 font-semibold">
              ${freelancer.price}/hr
            </div>
            <button className="view-more-button">View More</button>
          </div>
        ))}
      </div>
      <Freelancermodal
        freelancer={selectedFreelancer}
        onClose={handleCloseModal}
      />
      {/* Add freelancing websites section here */}
      <div className="alternative-platforms-container">
  <h3 className="alternative-platforms-heading">
    Not finding the right fit?
  </h3>
  <p className="alternative-platforms-message">
    If you'd like to explore more options beyond our experts, check out these platforms to find top cybersecurity professionals.
  </p>
  <div className="alternative-platforms-buttons">
    {freelancingWebsites.map((site, index) => (
      <a
        key={index}
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="platform-button"
      >
        {site.name}
      </a>
    ))}
  </div>
</div>

    </div>
  );
};

export default Marketplace;
