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
    """assess given url"""
    return web_safe_guard.get_site_data(url)

def handle_cybersecurity_query(query):
    """Find Query Related to Cyber Securitry Area"""
    response = llm.invoke(input=query)
    return response.content


# Define the tools that the agent can use
tools = [
    Tool(
        name="web_safe_guard",
        func=assess_url_safety,
        description="Analyzes a given URL for security vulnerabilities, server details, TLS certificate status, and JavaScript links. It provides recommendations for improvements, overall security ratings, and aggregates results from multiple threat intelligence engines to identify potential threats or weaknesses, such as phishing, malware, or suspicious activity. Ensures safer browsing by delivering comprehensive insights into the URL's safety.",
    ),
    Tool(
        name="cybersecurity_query_handler",
        func=handle_cybersecurity_query,
        description="Handles queries specifically related to cybersecurity topics. If the question is outside the scope of cybersecurity, it denies the request and prompts the user to ask a relevant question within the domain.",
    ),
]

# Load the correct JSON Chat Prompt from the hub
prompt = hub.pull("hwchase17/structured-chat-agent")

# Create a structured Chat Agent with Conversation Buffer Memory
# ConversationBufferMemory stores the conversation history, allowing the agent to maintain context across interactions
memory = ConversationBufferMemory(
    memory_key="chat_history", return_messages=True)

# create_structured_chat_agent initializes a chat agent designed to interact using a structured prompt and tools
# It combines the language model (llm), tools, and prompt to create an interactive agent
agent = create_structured_chat_agent(llm=llm, tools=tools, prompt=prompt)


agent_executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True,
    memory=memory,  # Use the conversation memory to maintain context
    handle_parsing_errors=True,  # Handle any parsing errors gracefully
)

initial_message = (
    "You are an AI assistant designed to provide accurate and helpful answers. You have access to the following tools: "
    "'web_safe_guard' to analyze URLs for security vulnerabilities, server details, TLS certificate status, JavaScript links, "
    "and overall security ratings, ensuring safer browsing by identifying potential threats or weaknesses; and "
    "'cybersecurity_query_handler' to address cybersecurity-related queries, such as malware analysis, threat detection, and "
    "best security practices. If a question falls outside these areas, kindly guide users to ask relevant questions."
)



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
    