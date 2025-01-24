from langchain.memory import ConversationBufferMemory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain import hub
from langchain_groq.chat_models import ChatGroq
from vendors.Web_Safe_Guard import web_safe_guard
from langchain_core.tools import Tool
import os
from pydantic import SecretStr
from Utility.utils import generate_session_id, to_serializable
from datetime import datetime, timezone
import time
from groq import RateLimitError


class ChatController:
    def __init__(self):
        # Load environment variables
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("MODEL_NAME")
        if not self.groq_api_key or not self.model_name:
            raise Exception("Missing GROQ_API_KEY or MODEL_NAME in .env file.")

        # Convert API key to SecretStr
        self.groq_api_key = SecretStr(self.groq_api_key)

        # Initialize the ChatGroq model
        self.llm = ChatGroq(
            model=self.model_name,
            temperature=0.7,
            api_key=self.groq_api_key,
            stop_sequences=None,
        )

        # Define tools
        # self.tools = [
        #     Tool(
        #         name="web_safe_guard",
        #         func=self.assess_url_safety,
        #         description="Use this tool ONLY to analyze URLs for security vulnerabilities, TLS certificate details, JavaScript links, and provide security recommendations.",
        #         return_direct=True,
        #     ),
        #     Tool(
        #         name="cybersecurity_query_handler",
        #         func=self.handle_cybersecurity_query,
        #         description="Use this tool ONLY to answer general cybersecurity-related questions.",
        #         return_direct=True,
        #     ),
        # ]

        self.tools = [
            Tool(
                name="web_safe_guard",
                func=self.assess_url_safety,
                description=(
                    "Use this tool to analyze URLs for security vulnerabilities, "
                    "and generate actionable insights based on the raw scan data. "
                    "Avoid generic outputs or predefined categories unless they are relevant to the data. "
                    "Tailor the report to specific findings and provide detailed, customized recommendations for improving the website's security posture."
                ),
                return_direct=True,
            ),
            Tool(
                name="cybersecurity_query_handler",
                func=self.handle_cybersecurity_query,
                description=(
                    "Use this tool to handle any cybersecurity-related questions, "
                    "provide clarifications about prior analysis, or expand on findings from the 'web_safe_guard' tool. "
                    "Always aim to provide detailed, easy-to-understand explanations and actionable advice."
                ),
                return_direct=True,
            ),
        ]

        # Define the memory store for in-session memory
        self.memory_store = {}

        # Load the structured chat prompt
        self.prompt = hub.pull("hwchase17/structured-chat-agent")

        self.initial_message = """
        You are a cybersecurity assistant with access to two tools:

        1. *web_safe_guard*: Use this tool to analyze URLs and generate detailed, actionable reports based on raw security scan data. Tailor each report to the findings and provide clear recommendations for improving security.

        2. *cybersecurity_query_handler*: Use this tool to answer general cybersecurity-related questions, provide clarifications about previous analyses, or expand on findings from the *web_safe_guard* tool.

        **Guidelines:**
        - If a user asks for a URL analysis and does not provide a URL, politely ask for the website URL first before proceeding.
        - For follow-up questions about a previously scanned website, refer to the existing analysis and provide additional context or clarification without re-scanning.
        - Re-scan a URL only if the user explicitly requests it or if the existing scan data appears outdated or incomplete.
        - Always provide clear, actionable insights and recommendations based on the data or context provided by the user.
        - Avoid including unnecessary technical jargon unless specifically requested or relevant to the findings.

        Your goal is to provide helpful, user-friendly assistance, tailoring each response to the specific request and context.

        """

    # Initialize memory for a given session, including past chat history.
    def initialize_memory(self, session_id, chat_history):
        # print("start memory====>")
        # print(session_id)
        # print("-----------")
        # print(chat_history)
        # print("-----------")
        # print(self.memory_store)
        # print("end memory===>")

        # Ensure all data in chat_history is serialized and flattened
        chat_history = to_serializable(chat_history)

        if session_id not in self.memory_store:
            memory = ConversationBufferMemory(
                memory_key="chat_history", return_messages=True
            )
            memory.chat_memory.add_message(SystemMessage(content=self.initial_message))

            # Add past messages to memory
            for message in chat_history:
                # print("before memory====>")
                if message["sender"] == "user":
                    # print("memory====>")
                    # print(message["text"])
                    memory.chat_memory.add_message(
                        HumanMessage(content=message["text"])
                    )
                elif message["sender"] == "bot":
                    memory.chat_memory.add_message(AIMessage(content=message["text"]))

            self.memory_store[session_id] = memory

        return self.memory_store[session_id]

    # Get or create an AgentExecutor for a session.
    def get_agent_executor(self, session_id, chat_history):
        memory = self.initialize_memory(session_id, chat_history)
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

    # Create a new chat session.
    async def create_new_session(self, user_id, request):
        chat_collection = request.app.mongodb["chat_sessions"]
        session_id = generate_session_id()
        new_chat = {
            "session_id": session_id,
            "user_id": user_id.get("_id"),
            "chat_name": "Untitled Chat",
            "messages": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await chat_collection.insert_one(new_chat)
        return {"session_id": session_id, "chat_name": "Untitled Chat"}

    # Save a message to an existing session or create a new session if none exists.
    async def save_message_or_create_new(self, session_id, user_id, message, request):
        chat_collection = request.app.mongodb["chat_sessions"]

        if session_id == "first-message":
            # Create a new session dynamically
            new_session = await self.create_new_session(user_id, request)
            session_id = new_session["session_id"]

        # Fetch the existing session
        chat_session = await chat_collection.find_one(
            {"session_id": session_id, "user_id": user_id.get("_id")}
        )

        # If the session exists and the chat name is still "Untitled Chat", set the first message as the chat name
        if chat_session and chat_session.get("chat_name") == "Untitled Chat":
            await chat_collection.update_one(
                {"session_id": session_id, "user_id": user_id.get("_id")},
                {"$set": {"chat_name": message}},
            )

        # Fetch the existing chat history
        chat_history = await self.fetch_chat_messages(session_id, user_id, request)

        # Generate bot response using LLM with chat history
        response = await self.process_prompt(message, session_id, chat_history)

        # Save the new message and bot response to the session
        await chat_collection.update_one(
            {"session_id": session_id, "user_id": user_id.get("_id")},
            {
                "$push": {
                    "messages": [
                        {
                            "sender": "user",
                            "text": message,
                            "timestamp": datetime.now(timezone.utc),
                        },  # Use timezone-aware datetime
                        {
                            "sender": "bot",
                            "text": response,
                            "timestamp": datetime.now(timezone.utc),
                        },
                    ]
                },
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )
        return {"session_id": session_id, "response": response}

    # Fetch all messages in a specific chat session.
    async def fetch_chat_messages(self, session_id, user_id, request):
        chat_collection = request.app.mongodb["chat_sessions"]
        chat_session = await chat_collection.find_one(
            {"session_id": session_id, "user_id": user_id.get("_id")}
        )
        if not chat_session:
            return []
        # print(chat_session.get("messages"))
        return to_serializable(chat_session.get("messages", []))
        # return to_serializable(chat_session)

    # Fetch all chat sessions for a user.
    async def fetch_sessions(self, user_id, request):
        chat_collection = request.app.mongodb["chat_sessions"]
        sessions = await chat_collection.find({"user_id": user_id.get("_id")}).to_list(
            100
        )
        return {"sessions": to_serializable(sessions)}

    # Rename a chat session.
    async def rename_session(self, session_id, user_id, new_name, request):
        chat_collection = request.app.mongodb["chat_sessions"]
        result = await chat_collection.update_one(
            {"session_id": session_id, "user_id": user_id.get("_id")},
            {
                "$set": {
                    "chat_name": new_name,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return {"success": result.modified_count > 0}

    # Responsible for Analysing Website

    def assess_url_safety(self, url):
        try:
            data = web_safe_guard.get_site_data(url)

        # formatted_prompt = f"""
        #     You are a cybersecurity expert tasked with analyzing a website's security posture. Below is the raw data from a security scan for a URL. Process this data and generate a detailed, actionable security report tailored to the findings. Exclude static or generic information and focus on insights derived from the raw data provided.

        #     Additionally, if the user requests information about a specific section (e.g., TLS details, findings, or recommendations), extract and present only that section from the report.

        #     ### Raw Data:
        #     {data}

        #     ### Report Format:

        #     #### 1. Overview
        #     - **URL**: Include the provided URL.
        #     - **Domain**: Mention the domain.
        #     - **Final Resolved URL**: Include if present.
        #     - **Server**: Specify the hosting provider or server software if available.

        #     #### 2. IP and Network Information
        #     - List all associated IP addresses and any relevant details about their configuration.

        #     #### 3. TLS Details
        #     - **Certificate Issuer**: Include issuer information.
        #     - **Expiration Date**: Mention the expiration date.
        #     - **TLS Rating**: Provide the rating if available (e.g., A, B, etc.).
        #     - **Cipher Suite**: Highlight the cipher suite used.

        #     #### 4. Security Ratings
        #     - Include the following if available:
        #         - **Overall Rating**: (e.g., B)
        #         - **TLS Security**: Provide the rating and summary of findings.
        #         - **Domain Configuration**: Mention the rating and its implications.
        #         - **General Security**: Highlight any key findings.

        #     #### 5. Findings (Comprehensive)
        #     Include **all detected findings** from the scan. Group them logically as:
        #     - **Headers**:
        #         - List missing or misconfigured headers (e.g., X-Content-Type-Options, CSP).
        #         - Highlight uncommon headers detected and their contents.
        #     - **SSL/TLS Details**:
        #         - Include SSL/TLS-specific findings, including cipher information, uncommon configurations, etc.
        #     - **Security Flags**:
        #         - Mention flagged issues such as suspicious or malicious activity, and highlight which tools flagged them (if any).
        #     - **Other Observations**:
        #         - Summarize any miscellaneous findings, such as server-specific details, uncommon configurations, or unique elements from the scan.

        #     If any findings were detected and include a **"see: link"** for further details, include it below:
        #     - **Link to findings**: [See the detailed findings here](insert_the_actual_link_from_raw_data)

        #     #### 6. JavaScript Resources
        #     - **External**: List external JavaScript files with any associated risks.
        #     - **Local**: Mention local JavaScript files found.

        #     #### 7. Recommendations
        #     Provide specific and actionable recommendations based on the findings. Categorize them as:
        #     - **Critical Actions**: For resolving urgent issues like malicious findings, misconfigured headers, or missing essential security features.
        #     - **Optional Improvements**: Suggestions for enhancing security, such as:
        #         - Adding a Web Application Firewall (WAF).
        #         - Enforcing HTTPS.
        #         - Regular vulnerability scanning.

        #     #### 8. Advanced Insights
        #     Include any additional insights if justified by the data, such as:
        #         - Enhanced threat detection mechanisms.
        #         - Monitoring third-party integrations.
        #         - Strategies for hardening overall web application security.

        #     ### Instructions for the LLM:
        #     1. Dynamically analyze the raw data provided in the template.
        #     2. Include all findings comprehensively, grouped under logical categories.
        #     3. Include sections only if applicable to the findings.
        #     4. **If the user requests a specific section (e.g., Findings or Recommendations), extract and present only that part of the report.**

        #     """

            formatted_prompt = f"""You are a cybersecurity expert tasked with analyzing the security posture of a website. Your goal is to process the raw data provided from a security scan and generate a **detailed, extensive security report** that highlights all relevant findings and provides actionable recommendations. Focus on delivering insights tailored to the data while avoiding generic or overly simplified responses.

            If necessary information (like the URL) is not provided, **ask the user for the missing details** before proceeding with the analysis.

            ### **Guidelines for Report Generation:**
            1. Analyze the raw data comprehensively and derive insights specific to the findings.
            2. Exclude static or generic information. Provide meaningful, actionable insights derived from the raw data.
            3. If GDPR compliance is relevant, determine whether the website meets GDPR standards and include detailed findings.
            4. Provide details of the technology stack used by the website (e.g., frameworks, servers, libraries) and reference relevant CVEs where vulnerabilities are detected. Include hyperlinks to the CVE details.
            5. If the user requests a specific section (e.g., Findings or Recommendations), extract and present only that section of the report.
            6. Present detailed context for each issue, including potential risks and the impact on the website's security posture.
            7. Ensure the report is **logical, well-structured, and fully explained**, catering to both technical and non-technical audiences.

            ### **Report Format** (Include sections dynamically based on the findings):

            #### 1. Overview
            - **URL**: Include the provided URL or ask the user for it if not included.
            - **Domain**: Mention the domain associated with the target.
            - **Server/Hosting Info**: Provide details about the server or hosting platform.
            - **Scanned Components**: Clearly list what was scanned (e.g., JavaScript files, SSL/TLS configurations, headers, etc.).

            #### 2. IP and Network Information
            - List all IP addresses associated with the target.
            - Provide relevant details about their configuration, such as geolocation, service providers, or any notable configurations.
            - Include any additional insights related to DNS, routing, or network exposure.

            #### 3. SSL/TLS Details (If Detected)
            - **Certificate Issuer**: Include details about the issuer.
            - **Expiration Date**: Mention when the certificate expires.
            - **Cipher Suite**: Highlight the cipher suite in use and its implications.
            - **Scanned Details**: Mention specific aspects of the SSL/TLS configuration that were analyzed (e.g., protocol versions, supported ciphers, key exchange mechanisms).
            - **Potential Weaknesses**: Explain if there are vulnerabilities or misconfigurations in the SSL/TLS setup, along with their impact.

            #### 4. GDPR Compliance
            - Check whether the website aligns with GDPR standards, focusing on areas such as:
              - Presence of a privacy policy.
              - Proper cookie consent mechanisms.
              - Secure handling of user data (e.g., encryption in transit and at rest).
              - Compliance with data retention and user rights (e.g., right to access, right to delete).
            - Highlight any non-compliance issues and their potential legal or operational risks.

            #### 5. Security Headers and Configuration
            - Identify missing or misconfigured security headers (e.g., Content-Security-Policy, X-Content-Type-Options, etc.).
            - Explain the purpose of each missing header and the risks associated with its absence.
            - Highlight any uncommon or suspicious headers detected during the scan.
            - **Scanned Headers**: Explicitly list all headers that were analyzed and their configuration details.

            #### 6. Technology Stack and Associated CVEs
            - **Tech Stack Details**: List the technologies, libraries, and frameworks detected (e.g., Node.js, React, Apache, etc.).
            - **Vulnerabilities**:
              - For each detected technology, check for known vulnerabilities (CVE data).
              - Include a brief description of each CVE along with a hyperlink to the CVE database (e.g., NVD or Mitre).
              - Example: [CVE-2022-12345](https://nvd.nist.gov/vuln/detail/CVE-2022-12345)
            - Highlight any outdated or vulnerable components and recommend updates or patches.

            #### 7. Findings and Vulnerabilities (Comprehensive)
            Group and explain all findings logically:
            - **Critical Vulnerabilities**: High-risk issues that require immediate attention (e.g., exposed credentials, malicious scripts, or serious misconfigurations).
            - **Warnings**: Medium-risk issues that need to be addressed but are not urgent.
            - **Informational Findings**: Observations that could help improve security posture but are not considered vulnerabilities.
            - **Scanned Components**: Clearly state what was analyzed and detected in this section (e.g., scripts, configurations, directories, files).

            Include relevant links for further reference (e.g., "see: link") if the scan data provides them.

            #### 8. JavaScript and External Resources
            - **External JavaScript Files**: List all external JavaScript files analyzed and assess their risk (e.g., outdated libraries, suspicious external sources).
            - **Local JavaScript Files**: Provide details of all local JavaScript files detected and flag any unusual behavior or configuration.
            - **Scanned Files**: Explicitly mention which files were analyzed in this section and include additional details, such as their paths or contents if available.

            #### 9. Recommendations
            Provide **specific, actionable recommendations** for each finding:
            - **Critical Actions**: Steps to resolve urgent vulnerabilities or address high-risk issues.
            - **Best Practices**: Suggestions for improving the website's overall security posture, such as implementing modern security headers, regular vulnerability scanning, or adding a Web Application Firewall (WAF).

            #### 10. Advanced Insights and Recommendations
            Include advanced analysis or suggestions, such as:
            - Potential threats from third-party integrations or dependencies.
            - Recommendations for monitoring and incident response.
            - Strategies for implementing proactive defenses (e.g., threat intelligence, enhanced logging).

            ---

            ### **Instructions for the Assistant:**
            1. Process the raw data thoroughly and dynamically include sections based on the findings.
            2. Explicitly mention all components, files, or configurations that were scanned and provide details where applicable.
            3. Provide GDPR compliance insights and analyze whether the website adheres to regulations.
            4. Cross-reference the detected technologies against known CVEs, including relevant hyperlinks.
            5. Deliver a clear, professional, and actionable report that aligns with the user’s needs.
            6. If information is missing (e.g., the URL), ask the user for it before generating the report.

            ### **Raw Data Provided**:
            {data}

            """
            
            response = self.llm.invoke(input=formatted_prompt)
            return response.content
        
        except RateLimitError as e:
            error_data = e.response.json()  # Parse the error for additional details
            wait_time = error_data.get('error', {}).get('reset_in', 420)  # Default to 7 minutes if not provided
            print(f"Rate limit exceeded. Waiting for {wait_time} seconds...")
            time.sleep(wait_time)  # Wait for the cooldown period
            return self.assess_url_safety(formatted_prompt)
        except Exception as ex:
            print(f"Unexpected error: {ex}")
            raise

      

    # Responsible for General Q&A
    def handle_cybersecurity_query(self, query):
        response = self.llm.invoke(input=query)
        return response.content

    # Generate a response using LLM with chat history.
    async def process_prompt(self, prompt, session_id: str, chat_history):
        # Get the agent executor for the session
        agent_executor = self.get_agent_executor(session_id, chat_history)

        # Process the prompt with the agent
        response = agent_executor.invoke({"input": prompt})

        return response["output"]
