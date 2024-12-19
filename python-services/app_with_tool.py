from dotenv import load_dotenv
from langchain import hub
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.tools import Tool
from langchain_groq.chat_models import ChatGroq
import os

# for web site basic Search(links, urls, server, etc...)
from vendors.Web_Safe_Guard import web_safe_guard


load_dotenv()

# Load API keys and model details
groq_api_key = os.getenv("GROQ_API_KEY")
model_name = os.getenv("MODEL_NAME")
if not groq_api_key or not model_name:
    raise Exception("Missing GROQ_API_KEY or MODEL_NAME in .env file.")

# Initialize the ChatGroq model
llm = ChatGroq(
    model=model_name,
    temperature=0.7,
    groq_api_key=groq_api_key,
)


# Tools
def assess_url_safety(url):
    """
    Dynamically assess the given URL and generate an actionable security report using the LLM.
    The LLM tailors the recommendations entirely based on the findings without hardcoding.
    """
    # Fetch the scan data
    data = web_safe_guard.get_site_data(url)
    
    # Construct a prompt to allow the LLM to decide and generate effective recommendations
    formatted_prompt = f"""
    You are a cybersecurity expert analyzing a website's security posture.
    Below is the result of a security scan for a URL. Review the data and generate a *detailed, actionable security report* tailored to the findings:

    {data}

    *Report Structure*: (if not mention specific detail otherwise give what is asking)
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
    
    # Use the LLM to generate the report dynamically
    response = llm.invoke(input=formatted_prompt)
    
    # Return the LLM-generated dynamic security report
    return response.content


def handle_cybersecurity_query(query):
    """Handle general cybersecurity-related questions."""
    response = llm.invoke(input=query)
    return response.content  # Directly return query output


# Define the tools that the agent can use
tools = [
    Tool(
        name="web_safe_guard",
        func=assess_url_safety,
        description="Use this tool ONLY to analyze URLs for security vulnerabilities, TLS certificate details, JavaScript links, and provide security recommendations. "
        "It outputs a *detailed security report* without any further action or summarization.",
        return_direct=True,  # tool outputs as the final response
    ),
    Tool(
        name="cybersecurity_query_handler",
        func=handle_cybersecurity_query,
        description="Use this tool ONLY to answer general cybersecurity-related questions, such as best practices, threat detection, malware, or security advice.",
        return_direct=True,  # tool outputs as the final response
    ),
]


# Load the correct JSON Chat Prompt from the hub
prompt = hub.pull("hwchase17/structured-chat-agent")

# Create a structured Chat Agent with Conversation Buffer Memory
# ConversationBufferMemory stores the conversation history, allowing the agent to maintain context across interactions
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# create_structured_chat_agent initializes a chat agent designed to interact using a structured prompt and tools
# It combines the language model (llm), tools, and prompt to create an interactive agent
agent = create_structured_chat_agent(llm=llm, tools=tools, prompt=prompt)


agent_executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True,
    memory=memory,
    return_intermediate_steps=False,  # Ensures cleaner outputs
    handle_parsing_errors=True,  # Graceful parsing failures
)


initial_message = """
You are a cybersecurity assistant with access to two tools:
1. *web_safe_guard*: Use this tool ONLY to analyze URLs and generate detailed reports.
2. *cybersecurity_query_handler*: Use this tool ONLY to answer general cybersecurity-related questions.

*Rules*:
- If the user asks a follow-up question about a previously scanned website, REFER TO the previous report instead of re-scanning.
- If a follow-up question relates to TLS, security ratings, JavaScript links, or any details from a prior scan, use the existing context to answer.
- Re-scan a URL ONLY when explicitly requested by the user.
"""



memory.chat_memory.add_message(SystemMessage(content=initial_message))

while True:
    user_input = input("User: ")
    if user_input.lower() == "exit":
        break

    # Add the user's message to the conversation memory
    memory.chat_memory.add_message(HumanMessage(content=user_input))

    # Invoke the agent with the user input and the current chat history
    response = agent_executor.invoke({"input": user_input})
    print("Bot:", response["output"])

    # Add the agent's response to the conversation memory
    memory.chat_memory.add_message(AIMessage(content=response["output"]))
    