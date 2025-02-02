import os
from langchain_groq.chat_models import ChatGroq


def generate_suggestive_prompt(groq_api_key, model_name, chat_history):
    llm = ChatGroq(
            model=model_name,
            temperature=0.7,
            api_key=groq_api_key,
            stop_sequences=None,
        )


    # Construct a system prompt to generate suggestive prompts
    system_prompt = (
            "Look at the chat history and the user's latest message, then suggest 2-3 follow-up questions that feel natural and engaging. "
        "Make the conversation flow smoothly by offering insightful or thought-provoking questions that help the user dive deeper into the topic. "
        "Keep the tone interactive and friendly while ensuring the user remains in control of the discussion. "
        "Avoid any introductions or explanations—just present the questions as separate lines for easy selection. "
        
        "If the last question is about CVEs, generate the following types of follow-up questions: "
        "- 'Do you have any specific version of the tech stack in question you need my help with?' "
        "- 'Do you want the latest CVEs for [tech stack vendor]?' "
        "- 'Are you looking for CVEs related to a particular vulnerability type or severity level?' "
        "Replace '[tech stack vendor]' dynamically with the relevant technology or vendor mentioned in the conversation. "
        
        "If the user asks about a security standard like GDPR, HIPAA, PCI DSS, or similar, generate the following types of follow-up questions: "
        "- 'How can I make my website [security standard] compliant?' "
        "- 'What are the key requirements for [security standard] compliance?' "
        "- 'Can you guide me on implementing [security standard] controls in my system?' "
        "Replace '[security standard]' dynamically with the mentioned standard."
        )

    query = next((msg['text'] for msg in reversed(chat_history) if msg['sender'] == 'user'), None)

    
    if not query:
        return [
            "**What are the most common cybersecurity threats today?**",
            "**How can I protect my personal data from cyberattacks?**",
            "**What are the best practices for securing online accounts?**"
        ]
        
        

    # Format chat history
    formatted_chat_history = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_history])

    # Generate related questions
    response = llm.invoke(
        input=f"{system_prompt}\n\nChat History:\n{formatted_chat_history}\n\nCurrent Query: {query}\n\nSuggest 2-3 related questions:"
    ).content

    questions = response.strip().split("\n")
    formatted_questions = [f"**{q.strip()}**" for q in questions if q.strip().endswith("?")]

    
    
    return formatted_questions