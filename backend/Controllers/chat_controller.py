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
from Utility.cve_utils import (
    extract_technologies_from_query,
    format_cve_response,
    fetch_cves_for_last_120_days,
)
from Utility.tech_stack_utils import fetch_tech_stack_from_query
from Controllers.suggestive_prompt_controller import generate_suggestive_prompt


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
            Tool(
                name="cve_query_tool",
                func=self.fetch_cves_from_query,
                description=(
                    "Use this tool to identify technologies or technical terms from a query, fetch relevant CVEs, and generate detailed vulnerability reports. "
                    "This tool is ideal for queries that reference specific technologies (e.g., Apache, Python, React) or technical vulnerabilities (e.g., authentication, filesystem, XSS). "
                    "If no recent CVEs are detected, use the LLM to provide a fallback response with older CVE data, broader risks, or relevant insights. "
                    "Always aim to deliver clear, actionable, and professional reports tailored to the query."
                ),
                return_direct=True,
            ),
            Tool(
                name="general_assistant",
                func=self.handle_other_query,
                description=(
                   "This tool is specifically designed to address inquiries that fall outside the domain of cybersecurity. It focuses on providing assistance with topics unrelated to security best practices, vulnerabilities, or threat intelligence."
            ),
               #return_direct=True,
            ),
        ]

        # Define the memory store for in-session memory
        self.memory_store = {}

        # Load the structured chat prompt
        self.prompt = hub.pull("hwchase17/structured-chat-agent")

        self.initial_message = """
        You are a cybersecurity assistant with access to three tools:

        1. *web_safe_guard*: Use this tool to analyze URLs and generate detailed, actionable reports based on raw security scan data. Tailor each report to the findings and provide clear recommendations for improving security.

        2. *cybersecurity_query_handler*: Use this tool to answer general cybersecurity-related questions, provide clarifications about previous analyses, or expand on findings from the *web_safe_guard* tool.
        
        3. *cve_query_tool*:
        - Use this tool to extract technologies or technical terms from the query, fetch the latest CVEs, and generate detailed reports.
        - Prioritize this tool for queries that mention specific software, libraries, or vulnerabilities (e.g., Apache, Python, XSS).
        - If no recent CVEs are found, use your knowledge base or fetch older data to provide relevant insights without explicitly mentioning the absence of recent CVEs.
        
        4. *general_assistant*: This tool is designed to handle inquiries unrelated to cybersecurity. It assists with general topics while **excluding** security best practices, vulnerability assessments, and threat intelligence.



        **Guidelines:**
        - For follow-up questions about a previously scanned website, refer to the existing analysis and provide additional context or clarification without re-scanning.
        - Re-scan a URL only if the user explicitly requests it or if the existing scan data appears outdated or incomplete.
        - Always provide clear, actionable insights and recommendations based on the data or context provided by the user.
        - Avoid including unnecessary technical jargon unless specifically requested or relevant to the findings.
        - *CVE Queries*:
            - Use the `cve_query_tool` for queries mentioning technologies, software, or vulnerabilities.
            - If the tool finds no CVEs, generate fallback insights using older CVE data or relevant knowledge without explicitly acknowledging the tool's limitations.
        - *Restrictions*:
            - **Do not** use the `general_assistant` tool for **coding-related queries**.
            - **Do not** use the `general_assistant` tool for **follow-up questions related to reports generated from website scans**.

        Your goal is to provide helpful, user-friendly assistance, tailoring each response to the specific request and context.

        """

    # Initialize memory for a given session, including past chat history.
    def initialize_memory(self, session_id, chat_history):
        #print("start memory====>")
        #print(session_id)
        #print("-----------")
        #print(chat_history)
        #print("-----------")
        #print(self.memory_store)
        #print("end memory===>")

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


    async def delete_session(self, session_id, user_id, request):
        chat_collection = request.app.mongodb["chat_sessions"]
        result = await chat_collection.delete_one(
            {"session_id": session_id, "user_id": user_id.get("_id")},
            
        )
        return {"success": result.deleted_count > 0}

    # Responsible for Analysing Website
    
    def fetch_CVEs_based_on_tech_stack(self, tech_stack):
        
        # To check all technologies in tech_stack:
        all_tech_stacks = []

        # Collect all technologies from the tech_stack dictionary into a single list
        all_tech_stacks.extend(tech_stack['client_side_tech_stack'])
        all_tech_stacks.extend(tech_stack['server_side_tech_stack'])
        all_tech_stacks.extend(tech_stack['js_libraries_used'])

            
        cve_data = {}  # Initialize the dictionary to store CVE results
    
        if all_tech_stacks:
            for tech in all_tech_stacks:
                cve_results = fetch_cves_for_last_120_days(tech, max_result=10)
                if isinstance(cve_results, list):  # Only add valid results
                    for cve in cve_results:
                        cve.pop('description', None)
                        cve.pop('last_modified_date', None)
                
                    cve_data[tech] = cve_results
    
        return cve_data


    def assess_url_safety(self, url):
        try:
            
            data = web_safe_guard.get_site_data(url) # fetch scan web data data 
            tech_stack = fetch_tech_stack_from_query(url) # fetch tech stack
            cve_results_on_tech_stack = self.fetch_CVEs_based_on_tech_stack(tech_stack) #  fetch CVEs based on Tech Stack
            
            data.append(cve_results_on_tech_stack) # add CVEs data based on tech stack
            data.append(tech_stack) # add tech stack

            formatted_prompt = f"""You are a cybersecurity expert tasked with analyzing the security posture of a website. Your goal is to process the raw data provided from a security scan and generate a **detailed, extensive security report** that highlights all relevant findings and provides actionable recommendations. Focus on delivering insights tailored to the data while avoiding generic or overly simplified responses.

        ### **Guidelines for Report Generation:**
        1. Analyze the raw data comprehensively and derive insights specific to the findings.
        2. Exclude static or generic information. Provide meaningful, actionable insights derived from the raw data.
        3. If the user requests a specific section (e.g., Findings or Recommendations), extract and present only that section of the report.
        4. Present detailed context for each issue, including potential risks and the impact on the website's security posture.
        5. Ensure the report is **logical, well-structured, and fully explained**, catering to both technical and non-technical audiences.
        6. Include GDPR compliance checks and note any violations or risks detected.
        7. Identify the technology stack (e.g., frameworks, servers, libraries) and include relevant CVE references in hyperlinks.
        
        ### **Report Format** (Include sections dynamically based on the findings):
        
        #### 1. Overview
        - **URL**: Include the provided URL or ask the user for it if not included.
        - **Domain**: Mention the domain associated with the target.
        - **Server/Hosting Info**: Provide details about the server or hosting platform.
        
        #### 2. IP and Network Information
        - List all IP addresses associated with the target.
        - Provide relevant details about their configuration, such as geolocation or any notable configurations.
        
        #### 3. SSL/TLS Details (If Detected)
        - **Certificate Issuer**: Include details about the issuer.
        - **Expiration Date**: Mention when the certificate expires.
        - **Cipher Suite**: Highlight the cipher suite in use and its implications.
        - **Potential Weaknesses**: Explain if there are vulnerabilities or misconfigurations in the SSL/TLS setup.
        
        #### 4. Security Headers and Configuration
        - Identify missing or misconfigured security headers (e.g., Content-Security-Policy, X-Content-Type-Options, etc.).
        - Explain the purpose of each missing header and the risks associated with its absence.
        - Highlight uncommon or suspicious headers detected during the scan.
        
        #### 5. Findings and Vulnerabilities (Comprehensive)
        Group and explain all findings logically:
        - **Critical Vulnerabilities**: High-risk issues that require immediate attention (e.g., exposed credentials, malicious scripts, or serious misconfigurations).
        - **Warnings**: Medium-risk issues that need to be addressed but are not urgent.
        - **Informational Findings**: Observations that could help improve security posture but are not considered vulnerabilities.
        
        Include relevant links for further reference (e.g., "see: link") if the scan data provides them.
        
        #### 6. JavaScript and External Resources
        - **External JavaScript Files**: Highlight external JavaScript files and assess their risk (e.g., outdated libraries, suspicious external sources).
        - **Local JavaScript Files**: List local JavaScript files and flag any unusual behavior or configuration.
        
        #### 7. Technology Stack
        - **Technology Stack**: List all technologies (e.g., frameworks, libraries, servers) used by the website, such as JavaScript frameworks, server-side languages, and external resources.

        #### 8. Related CVEs
        - **Related CVEs**: For each technology identified, provide CVE references with hyperlinks to vulnerabilities associated with those technologies.
        - Example: **JavaScript**:
            - [CVE-2024-45153](https://www.cve.org/CVERecord?id=CVE-2024-45153)  
                - **Published Date**: YYYY-MM-DD
                - **Severity**: Medium  
                - **Exploitability Score**: 2.3  
                - **Impact Score**: 2.7  
            - [CVE-2024-8743](https://www.cve.org/CVERecord?id=CVE-2024-8743)  
                - **Published Date**: YYYY-MM-DD
                - **Severity**: Medium  
                - **Exploitability Score**: 2.1  
                - **Impact Score**: 2.5  

        - Example: **Python/Django**: 
            - [CVE-2024-12345](https://www.cve.org/CVERecord?id=CVE-2024-12345)  
                - **Published Date**: YYYY-MM-DD
                - **Severity**: High  
                - **Exploitability Score**: 3.5  
                - **Impact Score**: 3.8
  
        #### 8. Recommendations
        Provide **specific, actionable recommendations** for each finding:
        - **Critical Actions**: Steps to resolve urgent vulnerabilities or address high-risk issues.
        - **Best Practices**: Suggestions for improving the website's overall security posture, such as implementing modern security headers, regular vulnerability scanning, or adding a Web Application Firewall (WAF).
        
        #### 9. Advanced Insights and Recommendations
        Include advanced analysis or suggestions, such as:
        - Potential threats from third-party integrations or dependencies.
        - Recommendations for monitoring and incident response.
        - Strategies for implementing proactive defenses (e.g., threat intelligence, enhanced logging).
        
        ---
        
        
       ### **Instructions for the Assistant**:
       1. Process the raw data dynamically and include sections based on the findings.
       2. Highlight GDPR compliance details and any technology stack vulnerabilities with CVE references.
       3. Deliver a clear, actionable, and professional report tailored to the findings.
               
        ### **Raw Data Provided**:
        {data}

        """

            response = self.llm.invoke(input=formatted_prompt)
            return response.content

        except RateLimitError as e:
            error_data = e.response.json()  # Parse the error for additional details
            wait_time = error_data.get("error", {}).get(
                "reset_in", 420
            )  # Default to 7 minutes if not provided
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
    
    
    # Responsible for General Q&A
    def handle_other_query(self, query):
        return f"Thank you for your question. However, I am a cybersecurity assistant, and my expertise is focused on cybersecurity-related topics. Unfortunately, I won’t be able to assist with your query as it falls outside my domain. If you have any cybersecurity-related questions, I’ll be happy to help!"
        

    def query_to_list(self,query):
        """
        Convert the query string into a list of technologies/terms.
        - Cleans the query by removing extra spaces.
        - Handles inconsistent delimiters like commas, spaces, and "and".
        - Returns a list of normalized terms.
        """
        # Step 1: Replace "and" with a comma for consistent splitting
        query = query.lower().replace(" and ", ",")

        # Step 2: Remove extra spaces and split into a list
        tech_list = [term.strip() for term in query.split(",") if term.strip()]

        return tech_list

    def fetch_cves_from_query(self, query):
        print("query-->")
        print(query)
        print("q end--->")
        """Extract technologies, fetch CVEs, and seamlessly fall back to the LLM or web for older data."""
        try:
            # Step 1: Extract technologies using custom logic
            # tech_list = extract_technologies_from_query(query, self.llm)
            # print(f"Extracted technologies: {tech_list}")

             # Step 1: Convert query into a list of technologies
            tech_list = self.query_to_list(query)
            print(f"Extracted technologies: {tech_list}")
            
            if not tech_list:
                # If no technologies detected, fall back directly to LLM for response generation
                return self.llm.invoke(
                    input=f"Generate a detailed response for this query: {query}"
                ).content

            # # Step 2: Fetch CVEs for detected technologies
            # cve_data = {}
            # for tech in tech_list:
            #     cve_data[tech] = fetch_cves_for_last_120_days(tech, max_result=50)

            # # Step 3: Check if any CVEs were found
            # print("cve data-->")
            # print(cve_data)
            # if any(cve_data.values()):
            #     # If CVEs are found, format the response
            #     formatted_response = format_cve_response(cve_data, self.llm)
            #     return formatted_response

            # Step 2: Fetch CVEs for detected technologies (if any)
            cve_data = {}
            if tech_list:
                for tech in tech_list:
                    cve_results = fetch_cves_for_last_120_days(tech, max_result=100)
                    if isinstance(cve_results, list):  # Only add valid     results
                        cve_data[tech] = cve_results

            # Step 3: Check if any CVEs were found
            if tech_list and any(cve_data.values()):  # At least one technology has CVEs
                print("Formatting CVE response...")
                return format_cve_response(cve_data, self.llm)

                # Step 4: Fallback to LLM for older data or context
            fallback_prompt = f"""
                The following technologies or technical terms were  identified: {', '.join(tech_list)}.
            No recent CVEs were found for these items in the last 120 days. However, generate a response based on:
            1. Older CVE data or relevant insights from your knowledge base.
            2. Broader security vulnerabilities or risks associated with these technologies.
            """
            fallback_response = self.llm.invoke(input=fallback_prompt).content
            return fallback_response

        except Exception as e:
            # Gracefully handle errors by falling back to LLM
            print(f"Error in fetch_cves_from_query: {str(e)}")
            return self.llm.invoke(
                input=f"Generate a fallback response for this query: {query}"
            ).content

    # Generate a response using LLM with chat history.
    async def process_prompt(self, prompt, session_id: str, chat_history):
        # Get the agent executor for the session
        agent_executor = self.get_agent_executor(session_id, chat_history)
        
        # Process the prompt with the agent
        response = agent_executor.invoke({"input": prompt})
        
        return response["output"]
        
    
    
    async def get_suggestive_prompt(self, session_id, user_id, request):
        
        # fetch chat history from database
        chat_history_with_session = await self.fetch_chat_messages(session_id, user_id, request)
        
        # return suggestive promt from past history
        return generate_suggestive_prompt(self.groq_api_key, self.model_name, chat_history_with_session)