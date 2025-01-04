from langchain.memory import ConversationBufferMemory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain import hub
from langchain_groq.chat_models import ChatGroq
from vendors.Web_Safe_Guard import web_safe_guard
from langchain_core.tools import Tool
import os
from fastapi import Request
import asyncio


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
            You are a cybersecurity expert tasked with analyzing a website's security posture. Below is the raw data from a security scan for a URL. Process this data and generate a detailed, actionable security report tailored to the findings. Exclude static or generic information and focus on insights derived from the raw data provided.

            Additionally, if the user requests information about a specific section (e.g., TLS details, findings, or recommendations), extract and present only that section from the report.

            ### Raw Data:
            {data}

            ### Report Format:

            #### 1. Overview
            - **URL**: Include the provided URL.  
            - **Domain**: Mention the domain.  
            - **Final Resolved URL**: Include if present.  
            - **Server**: Specify the hosting provider or server software if available.

            #### 2. IP and Network Information
            - List all associated IP addresses and any relevant details about their configuration.

            #### 3. TLS Details
            - **Certificate Issuer**: Include issuer information.  
            - **Expiration Date**: Mention the expiration date.  
            - **TLS Rating**: Provide the rating if available (e.g., A, B, etc.).  
            - **Cipher Suite**: Highlight the cipher suite used.

            #### 4. Security Ratings
            - Include the following if available:  
                - **Overall Rating**: (e.g., B)  
                - **TLS Security**: Provide the rating and summary of findings.  
                - **Domain Configuration**: Mention the rating and its implications.  
                - **General Security**: Highlight any key findings.

            #### 5. Findings (Comprehensive)
            Include **all detected findings** from the scan. Group them logically as:  
            - **Headers**:  
                - List missing or misconfigured headers (e.g., X-Content-Type-Options, CSP).  
                - Highlight uncommon headers detected and their contents.  
            - **SSL/TLS Details**:  
                - Include SSL/TLS-specific findings, including cipher information, uncommon configurations, etc.  
            - **Security Flags**:  
                - Mention flagged issues such as suspicious or malicious activity, and highlight which tools flagged them (if any).  
            - **Other Observations**:  
                - Summarize any miscellaneous findings, such as server-specific details, uncommon configurations, or unique elements from the scan.
                
            If any findings were detected and include a **"see: link"** for further details, include it below:  
            - **Link to findings**: [See the detailed findings here](insert_the_actual_link_from_raw_data)

            #### 6. JavaScript Resources
            - **External**: List external JavaScript files with any associated risks.  
            - **Local**: Mention local JavaScript files found.

            #### 7. Recommendations
            Provide specific and actionable recommendations based on the findings. Categorize them as:  
            - **Critical Actions**: For resolving urgent issues like malicious findings, misconfigured headers, or missing essential security features.  
            - **Optional Improvements**: Suggestions for enhancing security, such as:  
                - Adding a Web Application Firewall (WAF).  
                - Enforcing HTTPS.  
                - Regular vulnerability scanning.

            #### 8. Advanced Insights
            Include any additional insights if justified by the data, such as:  
                - Enhanced threat detection mechanisms.  
                - Monitoring third-party integrations.  
                - Strategies for hardening overall web application security.

            ### Instructions for the LLM:
            1. Dynamically analyze the raw data provided in the template.  
            2. Include all findings comprehensively, grouped under logical categories.  
            3. Include sections only if applicable to the findings.  
            4. **If the user requests a specific section (e.g., Findings or Recommendations), extract and present only that part of the report.**

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
