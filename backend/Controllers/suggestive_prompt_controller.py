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
        "Based on the following chat history and the user's latest query, generate 2-3 related and suggestive questions "
        "that deepen the conversation or provide new angles for exploration. Keep the questions meaningful and engaging."
        "Do not include any introductory text, explanations, or extra formatting—only output the questions as separate lines."
        "If the last question is about CVEs, generate follow-up questions such as whether the user wants to scan a specific language version or check for other CVE-related details."
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