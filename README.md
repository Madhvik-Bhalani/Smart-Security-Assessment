# Astra

## 🚀 Overview

**Astra** is an **AI-powered chatbot** designed to address **cybersecurity concerns**. It assists users by scanning web applications for vulnerabilities, providing **real-time AI-driven insights**, and facilitating **interactive cybersecurity discussions**. By integrating multiple security tools and APIs, it helps in **comprehensive risk assessments** and **threat mitigation**.
### 🔥 Key Features:

- 🛡️ **Automated vulnerability scanning** for web applications
- 🤖 **Real-time AI Chat** for security discussions and website scanning
- 📊 **Detailed security reports** with the latest CVE insights
- 🌐 **Integration with security APIs** (Nikto, VirusTotal, Sucuri)
- 🚀 **Interactive cybersecurity Q&A** for threat mitigation and best practices

---

## 🏗️ Installation

You can run this project using **Docker (Recommended)** or install it **manually**.

### **1️⃣ Docker Installation (Recommended)**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Madhvik-Bhalani/Smart-Security-Assessment.git
   cd Smart-Security-Assessment
   ```
2. **Build and run the Docker container**
   ```bash
   docker-compose up -d
   ```
3. **Access the application** at `http://localhost:3000`

---

### **2️⃣ Manual Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Madhvik-Bhalani/Smart-Security-Assessment.git
   cd Smart-Security-Assessment
   ```
2. **Open a new terminal window**, navigate to the backend directory, and run the backend API:
   ```bash
   cd backend
   python main.py
   ```
3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```
4. **Run the React application**
   ```bash
   npm start
   ```
5. **Access the frontend at** `http://localhost:3000`
6. **The backend runs at** `http://localhost:5000`

---

## 🎯 Usage

1️⃣ **Scan a Website for Vulnerabilities**

- Provide the URL you want to scan.
- The system fetches vulnerability reports using **Nikto, VirusTotal, and Sucuri APIs**.
- **AI analyzes and summarizes the results**.

2️⃣ **Real-time AI Chat for Cybersecurity**

- 🕵️ Ask AI to scan a website (e.g., *"Can you scan [https://example.com](https://example.com)?"*)
- 💡 Query AI about cybersecurity (e.g., *"What are the latest web vulnerabilities?"*)
- 📜 Generate **detailed security reports**
- 🔄 AI answers **follow-up questions** based on scan results
- 📁 **Manage chat history** (rename or delete chat sessions)

---

## 🛠️ Technologies Used

- ⚛️ **React** - Frontend UI
- 🐍 **Python (FastAPI)** - High-performance backend
- 🔍 **Nikto** - Web vulnerability scanner
- 🦠 **VirusTotal API** - Malware analysis
- 🔒 **Sucuri API** - Website security check
- 📡 **WebSockets** - Real-time chat interface
- 🤖 **AI-powered NLP** - Extracts cybersecurity insights
- 📌 **CVE Updates** - Stays up-to-date with latest threats

---

## 🤝 Contributing

🔹 Found an issue? Want to improve the project?

- Fork the repository 🍴
- Create a new branch 🌱
- Submit a pull request ✅

---


💡 **Stay secure, stay informed!** 🔐

