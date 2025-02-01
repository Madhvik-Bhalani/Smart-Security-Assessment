const questions = [
    // Existing questions
    {
      question: "What is phishing?",
      options: [
        "A type of malware",
        "An attempt to trick users into providing sensitive information",
        "A strong password generation technique",
      ],
      correct: 1,
      feedback:
        "Phishing is an attempt to trick users into providing sensitive information via fake websites or emails.",
    },
    {
      question: "Which password is the most secure?",
      options: ["password123", "Qw!7x9@_#P", "12345678"],
      correct: 1,
      feedback:
        "A secure password should include a mix of uppercase, lowercase, numbers, and special characters.",
    },
    {
      question: "What does SSL stand for?",
      options: [
        "Secure Sockets Layer",
        "Secure Software Logic",
        "System Security Lock",
      ],
      correct: 0,
      feedback:
        "SSL stands for Secure Sockets Layer, a protocol for encrypting information sent between a server and a client.",
    },
    {
      question: "What is two-factor authentication?",
      options: [
        "A method to verify identity using two different factors",
        "A way to log in using two devices",
        "A password reset system",
      ],
      correct: 0,
      feedback:
        "Two-factor authentication uses two methods (e.g., a password and a phone code) to verify identity for enhanced security.",
    },
    {
      question: "What is a brute force attack?",
      options: [
        "An attempt to guess passwords by systematically trying combinations",
        "A method to overload a server with traffic",
        "A phishing scam targeting financial institutions",
      ],
      correct: 0,
      feedback:
        "A brute force attack involves systematically guessing passwords to gain unauthorized access to accounts.",
    },
    // Additional questions
    {
      question: "What is a firewall?",
      options: [
        "A tool that scans for malware",
        "A barrier that monitors and controls network traffic",
        "An encryption protocol",
      ],
      correct: 1,
      feedback:
        "A firewall monitors and controls incoming and outgoing network traffic to block unauthorized access.",
    },
    {
      question: "What is ransomware?",
      options: [
        "A type of malware that locks files until a ransom is paid",
        "An encryption tool for secure communication",
        "A fake website used for phishing",
      ],
      correct: 0,
      feedback:
        "Ransomware is a type of malware that encrypts a user's data and demands a ransom for its release.",
    },
    {
      question: "What does VPN stand for?",
      options: [
        "Virtual Private Network",
        "Virtual Protocol Node",
        "Verified Personal Network",
      ],
      correct: 0,
      feedback:
        "VPN stands for Virtual Private Network, which secures your internet connection by encrypting data and masking your IP address.",
    },
    {
      question: "What is a DDoS attack?",
      options: [
        "A method to encrypt data",
        "A type of malware that steals credentials",
        "An attack that overwhelms a server with traffic",
      ],
      correct: 2,
      feedback:
        "A DDoS (Distributed Denial of Service) attack overwhelms a server with traffic to disrupt its functionality.",
    },
    {
      question: "What is the role of antivirus software?",
      options: [
        "To optimize the system's speed",
        "To detect and remove malicious software",
        "To back up critical data",
      ],
      correct: 1,
      feedback:
        "Antivirus software detects and removes malicious software to protect your system from security threats.",
    },
    {
      question: "What is social engineering in cybersecurity?",
      options: [
        "Hacking systems using advanced tools",
        "Manipulating individuals to gain confidential information",
        "Creating fake websites for scams",
      ],
      correct: 1,
      feedback:
        "Social engineering involves manipulating individuals into divulging confidential information, often through deception.",
    },
    {
      question: "Which is an example of multi-factor authentication?",
      options: [
        "Using a password and a fingerprint",
        "Logging in from two devices",
        "Resetting your password",
      ],
      correct: 0,
      feedback:
        "Multi-factor authentication uses a combination of two or more factors, such as a password and a fingerprint.",
    },
    {
      question: "What is encryption?",
      options: [
        "A method to convert data into unreadable code",
        "A tool to scan for viruses",
        "A backup system for files",
      ],
      correct: 0,
      feedback:
        "Encryption converts data into unreadable code to protect it from unauthorized access.",
    },
    {
      question: "What does HTTPS signify in a URL?",
      options: [
        "The website uses secure communication protocols",
        "The website is hosted on a private server",
        "The website is optimized for speed",
      ],
      correct: 0,
      feedback:
        "HTTPS signifies that the website uses secure communication protocols to encrypt data sent between the user and the server.",
    },
    {
      question: "What is the primary purpose of a CAPTCHA?",
      options: [
        "To enhance website speed",
        "To distinguish humans from bots",
        "To encrypt user data",
      ],
      correct: 1,
      feedback:
        "CAPTCHAs are used to distinguish humans from bots, preventing automated access to online services.",
    },
    {
      question: "What is the dark web?",
      options: [
        "A part of the internet used for legitimate purposes",
        "A hidden network requiring specific software to access",
        "A tool for blocking malicious websites",
      ],
      correct: 1,
      feedback:
        "The dark web is a hidden part of the internet accessible only through specific software like Tor, often used for anonymity.",
    },
    {
      question: "What is spyware?",
      options: [
        "Software designed to monitor and collect user information",
        "A tool to enhance system performance",
        "A software patch for fixing vulnerabilities",
      ],
      correct: 0,
      feedback:
        "Spyware is malicious software designed to monitor and collect user information without consent.",
    },
    {
      question: "What is the most secure way to use public Wi-Fi?",
      options: [
        "Connect directly without any tools",
        "Use a VPN to encrypt your connection",
        "Ensure the Wi-Fi has a strong password",
      ],
      correct: 1,
      feedback:
        "Using a VPN encrypts your connection, making it the most secure way to use public Wi-Fi.",
    },
    {
      question: "What is a phishing email?",
      options: [
        "An email from a trusted source",
        "An email attempting to steal sensitive information",
        "An email promoting cybersecurity awareness",
      ],
      correct: 1,
      feedback:
        "A phishing email is designed to trick users into revealing sensitive information, such as passwords or financial details.",
    },
    {
      question: "What does a software patch do?",
      options: [
        "Fixes vulnerabilities and improves software security",
        "Removes unused applications from the system",
        "Optimizes the system's speed",
      ],
      correct: 0,
      feedback:
        "A software patch fixes vulnerabilities and improves the security of software.",
    },
    {
      question: "What is the purpose of a strong security policy in an organization?",
      options: [
        "To control employee activities",
        "To define rules for maintaining cybersecurity",
        "To increase employee productivity",
      ],
      correct: 1,
      feedback:
        "A strong security policy defines rules and guidelines to maintain cybersecurity within an organization.",
    },
    {
        question: "What is the purpose of GDPR in cybersecurity?",
        options: [
          "To regulate data privacy and protection in the EU",
          "To provide a framework for network security",
          "To enforce encryption protocols globally",
        ],
        correct: 0,
        feedback:
          "GDPR (General Data Protection Regulation) regulates data privacy and protection within the European Union, ensuring organizations safeguard personal data.",
      },
      {
        question: "What is PCI DSS?",
        options: [
          "A cybersecurity framework for healthcare organizations",
          "A standard for securing payment card information",
          "A protocol for encrypting network traffic",
        ],
        correct: 1,
        feedback:
          "PCI DSS (Payment Card Industry Data Security Standard) ensures organizations securely process, store, and transmit payment card information.",
      },
      {
        question: "What does the OWASP Top 10 represent?",
        options: [
          "A list of the top 10 cybersecurity tools",
          "The top 10 critical security risks for web applications",
          "The top 10 encryption algorithms",
        ],
        correct: 1,
        feedback:
          "The OWASP Top 10 highlights the most critical security risks for web applications, helping developers mitigate vulnerabilities.",
      },
      {
        question: "What is the primary purpose of NIST in cybersecurity?",
        options: [
          "To define best practices for cybersecurity",
          "To monitor network traffic",
          "To enforce international cybersecurity laws",
        ],
        correct: 0,
        feedback:
          "NIST (National Institute of Standards and Technology) provides a framework for best practices in cybersecurity, widely adopted in the industry.",
      },
      {
        question: "What is SQL injection?",
        options: [
          "A method to overload a server",
          "An attack that exploits vulnerabilities in SQL queries",
          "A technique to encrypt data in databases",
        ],
        correct: 1,
        feedback:
          "SQL injection exploits vulnerabilities in SQL queries to gain unauthorized access to databases.",
      },
      {
        question: "What is a zero-day vulnerability?",
        options: [
          "A vulnerability that is fixed within 24 hours",
          "A vulnerability that is exploited before being publicly known",
          "A vulnerability in outdated software",
        ],
        correct: 1,
        feedback:
          "A zero-day vulnerability is exploited by attackers before the software vendor becomes aware or releases a fix.",
      },
      {
        question: "What is the CIS Critical Security Controls framework?",
        options: [
          "A set of guidelines to manage malware",
          "A prioritized set of cybersecurity best practices",
          "A tool to identify phishing attempts",
        ],
        correct: 1,
        feedback:
          "The CIS Critical Security Controls framework provides a prioritized set of actions to improve cybersecurity defenses.",
      },
      {
        question: "What is the primary purpose of penetration testing?",
        options: [
          "To identify vulnerabilities by simulating attacks",
          "To monitor network activity",
          "To enforce compliance with standards",
        ],
        correct: 0,
        feedback:
          "Penetration testing identifies vulnerabilities in systems and applications by simulating real-world cyberattacks.",
      },
      {
        question: "What does the CVE database provide?",
        options: [
          "A list of known vulnerabilities",
          "A guide to encrypt sensitive data",
          "A set of tools to monitor malware",
        ],
        correct: 0,
        feedback:
          "The CVE (Common Vulnerabilities and Exposures) database provides a list of publicly known security vulnerabilities.",
      },
      {
        question: "What is the main purpose of ISO 27001?",
        options: [
          "To define secure encryption algorithms",
          "To provide a framework for an information security management system",
          "To regulate data protection within the EU",
        ],
        correct: 1,
        feedback:
          "ISO 27001 provides a framework for establishing, implementing, and managing an information security management system.",
      },
      {
        question: "What is a buffer overflow attack?",
        options: [
          "An attack that overloads a server with traffic",
          "An attack that exploits memory allocation vulnerabilities",
          "An attack targeting outdated software",
        ],
        correct: 1,
        feedback:
          "A buffer overflow attack exploits vulnerabilities in memory allocation, allowing attackers to overwrite adjacent memory locations.",
      },
      {
        question: "What is the main purpose of a cybersecurity audit?",
        options: [
          "To monitor daily network traffic",
          "To assess compliance with security standards",
          "To identify and fix vulnerabilities in real-time",
        ],
        correct: 1,
        feedback:
          "A cybersecurity audit assesses an organization's compliance with security standards and identifies areas for improvement.",
      },
      {
        question: "What does XSS stand for in cybersecurity?",
        options: [
          "Cross-Site Scripting",
          "Extended Security Standard",
          "Cross-Site Security",
        ],
        correct: 0,
        feedback:
          "XSS (Cross-Site Scripting) is a vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.",
      },
      {
        question: "What is the primary function of TLS?",
        options: [
          "To encrypt data transmitted over a network",
          "To detect phishing attempts",
          "To create backups of sensitive information",
        ],
        correct: 0,
        feedback:
          "TLS (Transport Layer Security) encrypts data transmitted over a network, ensuring secure communication.",
      },
      {
        question: "What is the role of SOC in cybersecurity?",
        options: [
          "To regulate compliance with GDPR",
          "To monitor and respond to security incidents",
          "To develop encryption protocols",
        ],
        correct: 1,
        feedback:
          "A Security Operations Center (SOC) monitors and responds to security incidents to protect an organization's assets.",
      },
      {
        question: "What is a man-in-the-middle (MITM) attack?",
        options: [
          "An attack that intercepts communication between two parties",
          "An attack that crashes a server",
          "An attack that overloads network traffic",
        ],
        correct: 0,
        feedback:
          "A man-in-the-middle (MITM) attack intercepts communication between two parties to eavesdrop or modify data.",
      },
      {
        question: "What is the purpose of access control in cybersecurity?",
        options: [
          "To prevent unauthorized access to resources",
          "To encrypt sensitive information",
          "To optimize network performance",
        ],
        correct: 0,
        feedback:
          "Access control ensures only authorized users can access specific resources, preventing unauthorized access.",
      },
      {
        question: "What does HIPAA regulate in cybersecurity?",
        options: [
          "Data security in financial institutions",
          "Health information privacy and security",
          "Network encryption protocols",
        ],
        correct: 1,
        feedback:
          "HIPAA (Health Insurance Portability and Accountability Act) regulates the privacy and security of health information.",
      },
      {
        question: "What is the purpose of a honeypot in cybersecurity?",
        options: [
          "To detect and analyze cyberattacks",
          "To block malicious websites",
          "To encrypt sensitive data",
        ],
        correct: 0,
        feedback:
          "A honeypot is a decoy system designed to attract attackers and analyze their behavior.",
      },
      {
        question: "What is the primary function of a cybersecurity policy?",
        options: [
          "To define rules and procedures for protecting assets",
          "To regulate data protection within the EU",
          "To optimize network performance",
        ],
        correct: 0,
        feedback:
          "A cybersecurity policy defines rules and procedures to protect an organization's assets and information.",
      },
      {
        question: "What is malware?",
        options: [
          "Software designed to protect systems",
          "Malicious software intended to harm or exploit systems",
          "A tool to enhance system performance",
        ],
        correct: 1,
        feedback:
          "Malware is malicious software designed to harm or exploit systems, networks, or devices.",
      },
      {
        question: "What is an insider threat in cybersecurity?",
        options: [
          "A threat caused by external hackers",
          "A threat caused by an organization's employees or trusted individuals",
          "A threat targeting outdated systems",
        ],
        correct: 1,
        feedback:
          "An insider threat arises when trusted individuals misuse their access to harm an organization's assets or data.",
      },
      {
        question: "What does CCPA regulate in cybersecurity?",
        options: [
          "Data privacy and protection in California",
          "Global cybersecurity standards",
          "Health information security",
        ],
        correct: 0,
        feedback:
          "The California Consumer Privacy Act (CCPA) regulates data privacy and protection for residents of California.",
      },
      {
        question: "What is the purpose of data masking?",
        options: [
          "To encrypt data during transmission",
          "To hide sensitive data from unauthorized access",
          "To optimize database performance",
        ],
        correct: 1,
        feedback:
          "Data masking hides sensitive data by substituting it with fake but realistic data to prevent unauthorized access.",
      },
  ];
  
  export default questions;
  