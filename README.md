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
2. **Run the project with a single command**
   ```bash
   docker-compose up -d --build
   ```
3. **Access the Astra website** at `http://localhost:3000`

---

### **2️⃣ Manual Installation**

#### **Astra Website**

1. **Clone the Astra repository**
   ```bash
   git clone https://github.com/Madhvik-Bhalani/Smart-Security-Assessment.git
   cd Smart-Security-Assessment
   ```
2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```
3. **Run the Astra React application**
   ```bash
   npm start
   ```
4. **Open a new terminal window**, navigate to the backend directory, create a virtual environment, install dependencies, and run the backend API:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
5. **Access the Astra frontend at** `http://localhost:3000`
6. **Access the backend at** `http://localhost:5000`


#### **Codefinity Team Website**

1. **Clone the Codefinity repository**
   ```bash
   git clone --branch codefinity-website https://github.com/Madhvik-Bhalani/Smart-Security-Assessment.git
   cd Smart-Security-Assessment
   ```
2. **Run the Codefinity website with Docker**
   ```bash
   docker-compose up -d --build
   ```
3. **Access the Codefinity website at** `http://localhost:2000`

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

