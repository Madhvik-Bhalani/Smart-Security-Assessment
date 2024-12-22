from langchain.memory import ConversationBufferMemory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain import hub
from langchain_groq.chat_models import ChatGroq
from vendors.Web_Safe_Guard import web_safe_guard
from langchain_core.tools import Tool
import os
from fastapi import Request

class ChatController:
    def __init__(self):
        # Load environment variables
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("MODEL_NAME")
        if not self.groq_api_key or not self.model_name:
            raise Exception("Missing GROQ_API_KEY or MODEL_NAME in .env file.")
        
        # Initialize the ChatGroq model
        self.llm = ChatGroq(
            model=self.model_name,
            temperature=0.7,
            groq_api_key=self.groq_api_key,
        )

        # Define tools
        self.tools = [
            Tool(
                name="web_safe_guard",
                func=self.assess_url_safety,
                description="Use this tool ONLY to analyze URLs for security vulnerabilities, TLS certificate details, JavaScript links, and provide security recommendations.",
                return_direct=True,
            ),
            Tool(
                name="cybersecurity_query_handler",
                func=self.handle_cybersecurity_query,
                description="Use this tool ONLY to answer general cybersecurity-related questions.",
                return_direct=True,
            ),
        ]

        # Load the structured chat prompt
        self.prompt = hub.pull("hwchase17/structured-chat-agent")
        
        self.initial_message = """
        You are a cybersecurity assistant with access to two tools:
        1. *web_safe_guard*: Use this tool ONLY to analyze URLs and generate detailed reports.
        2. *cybersecurity_query_handler*: Use this tool ONLY to answer general cybersecurity-related questions.

        *Rules*:
        - If the user asks a follow-up question about a previously scanned website, REFER TO the previous report instead of re-scanning.
        - If a follow-up question relates to TLS, security ratings, JavaScript links, or any details from a prior scan, use the existing context to answer.
        - Re-scan a URL ONLY when explicitly requested by the user.
        """


    def initialize_memory(self, session_id):
        """Initialize memory for a given session."""
        if not hasattr(self, 'memory_store'):
            self.memory_store = {}
        if session_id not in self.memory_store:
            memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
            memory.chat_memory.add_message(SystemMessage(content=self.initial_message))
            self.memory_store[session_id] = memory
        
        return self.memory_store[session_id]


    def get_agent_executor(self, session_id):
        """Get or create an AgentExecutor for a session."""
        memory = self.initialize_memory(session_id)
        agent = create_structured_chat_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=self.prompt,
        )
        return AgentExecutor.from_agent_and_tools(
            agent=agent,
            tools=self.tools,
            verbose=True,
            memory=memory,
            return_intermediate_steps=False,
            handle_parsing_errors=True,
        )


    def assess_url_safety(self, url):
        data = web_safe_guard.get_site_data(url)
        formatted_prompt = f"""
            You are a cybersecurity expert analyzing a website's security posture.
            Below is the result of a security scan for a URL. Review the data and generate a *detailed, actionable security report* tailored to the findings:

            {data}

            *Report Structure*: 
            1. *URL Information*: 
            - Include the provided URL, domain, and final resolved URL.

            2. *TLS Certificate Details*: 
            - Detail the issuer, expiration date, and authority.
            - Rate the TLS security (e.g., A, B, C) and explain its meaning.

            3. *Security Ratings*: 
            - List TLS rating, overall security rating, and domain rating.
            - Include an explanation of the ratings and implications for the user.

            4. *Scan Summary*: 
            - Provide a summary of malicious, suspicious, undetected, and harmless findings.
            - If there are malicious findings, mention *which engines flagged them* and explain their risks.

            5. *Server and IP Information*:
            - Include server details, hosting provider, and IP addresses.

            6. *JavaScript Links*:
            - List both local and external JavaScript files.
            - Identify any external JS files that may pose risks or require review.

            7. *Effective Step-by-Step Recommendations*:
            - *Critical Recommendations* (if applicable):
                a. *Address Critical Issues: If malicious or suspicious findings exist, provide **steps to identify, fix, and verify* the issues.
                b. *Improve TLS Security*: Suggest specific fixes if TLS has weaknesses.
                c. *Validate JavaScript*: Recommend actions only if untrusted or risky JS files are identified.
                - *Optional Enhancements* (only if weaknesses exist):
                d. *Implement Security Headers*:
                - Suggest headers (CSP, X-Frame-Options, X-Content-Type-Options) only if missing.
                e. *Regular Maintenance*:
                - Propose vulnerability scans or updates *only if outdated components or threats are detected*.

            8. *Additional Advanced Insights*:
            - Suggest further security enhancements *only if justified* based on the data, such as:
            - Web Application Firewall (WAF) implementation.
            - HTTPS-only enforcement.
            - Monitoring suspicious third-party integrations or JavaScript files.
            - Improving logging, monitoring, or threat detection.

            ### Important Instructions:
            - *Exclude generic or unnecessary suggestions* unless explicitly required based on findings.
            - If the scan results are clean, focus on maintenance and proactive improvements only.
            """
        response = self.llm.invoke(input=formatted_prompt)
        return response.content


    def handle_cybersecurity_query(self, query):
        response = self.llm.invoke(input=query)
        return response.content

    async def process_prompt(self, prompt, session_id: str):
        # Get the agent executor for the session
        agent_executor = self.get_agent_executor(session_id)

        # Add user input to memory
        memory = self.memory_store[session_id]
        memory.chat_memory.add_message(HumanMessage(content=prompt))

        # Process the prompt with the agent
        response = agent_executor.invoke({"input": prompt})

        # Add agent's response to memory
        memory.chat_memory.add_message(AIMessage(content=response["output"]))
        
        return response["output"]
