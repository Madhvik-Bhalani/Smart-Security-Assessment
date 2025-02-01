import React, { useState } from "react";
import "./NewsletterPage.css";
import image1 from "../../assets/NL1.jpg";
import image2 from "../../assets/NL2.jpg";
import image3 from "../../assets/NL3.jpg";
import image4 from "../../assets/NL4.jpg";
import image5 from "../../assets/NL5.png";
import image6 from "../../assets/NL6.jpg";

const newsletters = [
    {
        id: 1,
        image: image1,
        title: "Introduction to Astra: Your Cybersecurity Companion",
        content:
            "In today’s digital-first world, cybersecurity is no longer optional—it’s essential. Astra, your AI-powered cybersecurity companion, is here to transform the way you think about online safety. This newsletter dives into how Astra combines cutting-edge technology with user-friendly features to provide comprehensive protection. From identifying vulnerabilities in your system to mitigating real-time threats, Astra acts as both a shield and a guide for individuals and organizations. Whether you’re managing sensitive data, safeguarding customer information, or simply browsing online, Astra’s intuitive design and advanced threat detection make cybersecurity accessible to everyone. Discover how Astra’s regular updates, detailed reports, and customizable settings ensure you stay one step ahead of cybercriminals."
    },
    {
        id: 2,
        image: image2,
        title: "CVE Spotlight: Vulnerabilities You Should Know",
        content:
            "The digital landscape is constantly evolving, but so are the threats that plague it. Common Vulnerabilities and Exposures (CVEs) are the backbone of global cybersecurity awareness, cataloging the risks that could jeopardize your systems. In this newsletter, we explore the most significant CVEs reported this year, dissecting how these vulnerabilities are exploited and the impact they’ve had worldwide. From ransomware attacks targeting critical infrastructure to vulnerabilities in popular software platforms, we provide a comprehensive look at what went wrong and how to fix it. Learn about tools like vulnerability scanners and patch management systems to keep your infrastructure secure. With actionable tips and links to additional resources, this newsletter is your ultimate guide to staying informed and proactive against potential threats."
    },
    {
        id: 3,
        image: image3,
        title: "Types of Cybersecurity Vulnerabilities Explained",
        content:
            "Cyberattacks exploit vulnerabilities, but what exactly are these weak points, and how do they manifest? This newsletter provides a deep dive into the most common types of vulnerabilities affecting individuals and organizations alike. Explore how SQL Injection can expose sensitive data, Cross-Site Scripting (XSS) can compromise your users’ trust, and Man-in-the-Middle Attacks can silently intercept communications. Each vulnerability is explained with real-world case studies, showing the devastating consequences of inadequate security measures. Beyond understanding these threats, you’ll learn how to implement robust countermeasures, from encrypting data in transit to using web application firewalls. By the end of this newsletter, you’ll have a clearer understanding of how attackers think and how to stay one step ahead."
    },
    {
        id: 4,
        image: image4,
        title: "Cybersecurity Insights: Trends and Best Practices",
        content:
            "Cybersecurity is no longer just a defensive strategy—it’s a critical enabler of innovation and trust. In this newsletter, we explore the trends reshaping the cybersecurity landscape, including the rise of zero-trust architectures, advancements in cloud security, and the increasing reliance on machine learning models for threat detection. With remote work becoming the norm, we highlight how businesses are addressing new challenges like securing virtual environments and mitigating insider threats. Best practices are more essential than ever: discover how multi-factor authentication, endpoint security, and continuous monitoring are becoming standard operating procedures. Whether you’re an individual user or an IT professional, these insights will empower you to strengthen your defenses and adapt to an ever-changing digital world."
    },
    {
        id: 5,
        image: image5,
        title: "The Role of AI in Cybersecurity",
        content:
            "Artificial Intelligence (AI) is revolutionizing the cybersecurity landscape, bringing unprecedented speed and efficiency to threat detection and mitigation. This newsletter delves into how AI-driven tools identify anomalies in vast amounts of data, predict potential attacks, and automate responses to neutralize threats before they cause damage. Learn about innovative applications like AI-powered intrusion detection systems, behavioral analytics, and real-time phishing prevention tools. However, the rise of AI also comes with challenges: adversaries are leveraging AI to create more sophisticated attacks, including deepfake scams and AI-powered malware. We explore these dual-edged capabilities, highlighting the importance of ethical AI development and robust safeguards. With case studies and expert opinions, this newsletter provides a well-rounded perspective on how AI is shaping the future of cybersecurity."
    },
    {
        id: 6,
        image: image6,
        title: "Building a Secure Future: A Cyber Hygiene Guide",
        content:
            "Cyber hygiene is the cornerstone of a secure digital life, yet many overlook its importance in the race for technological advancement. This newsletter offers a step-by-step guide to building strong cyber hygiene habits that protect both personal and organizational data. Learn how to create passwords that are not just strong but also unique, and discover tools like password managers that simplify security. Phishing emails remain one of the most common attack vectors—find out how to recognize suspicious links and attachments before they cause harm. Explore the importance of keeping your software and systems up to date, using antivirus programs, and performing regular data backups. With clear explanations and actionable advice, this newsletter ensures you have the knowledge and tools to maintain a secure digital presence in an increasingly connected world."
    },
];

const NewsletterPage = () => {
    const [selectedNewsletter, setSelectedNewsletter] = useState(null);

    const openModal = (newsletter) => {
        setSelectedNewsletter(newsletter);
    };

    const closeModal = () => {
        setSelectedNewsletter(null);
    };

    return (
        <div className="newsletter-page-container">
            <h2 className="newsletter-page-heading">Explore Our Newsletters</h2>
            <div className="newsletter-card-grid">
                {newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="newsletter-card">
                        <div className="newsletter-image-wrapper">
                            <img
                                src={newsletter.image}
                                alt={newsletter.title}
                                className="newsletter-image"
                            />
                        </div>
                        <div className="newsletter-content">
                            <h3 className="newsletter-title">{newsletter.title}</h3>
                            <button
                                className="read-more-button"
                                onClick={() => openModal(newsletter)}
                            >
                                Read More
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedNewsletter && (
                <div className="newsletter-modal">
                    <div className="modal-content">
                        <button className="close-modal-button" onClick={closeModal}>
                            &times;
                        </button>
                        <h2 className="modal-title">{selectedNewsletter.title}</h2>
                        <p className="news-text">{selectedNewsletter.content}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterPage;
