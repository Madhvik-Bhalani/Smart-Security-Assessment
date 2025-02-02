import os
from langchain_groq.chat_models import ChatGroq


def generate_chat_summarization(groq_api_key, model_name, chat_history):
    llm = ChatGroq(
            model=model_name,
            temperature=0.7,
            api_key=groq_api_key,
            stop_sequences=None,
        )

    system_prompt = (
         "You are an AI assistant summarizing a conversation in a natural, engaging, and storytelling manner. "
    "Avoid generic opening lines like 'Let me summarize our conversation' or 'Here’s a summary.' "
    "Instead, craft a smooth introduction that naturally transitions into the key discussion points.\n\n"
    "Your summary should:\n"
    "- Engage the reader by making them feel like part of the conversation.\n"
    "- Use ‘you’ instead of ‘the user’ to create a more immersive experience.\n"
    "- Avoid a dry Q&A format—instead, weave the discussion into a natural, seamless flow.\n"
    "- Highlight key takeaways while maintaining clarity and coherence.\n"
    "- Ensure professionalism while keeping the tone approachable and engaging.\n\n"
    "Maintain the logical sequence of events, preserve important details, and make sure the summary reflects both "
    "the AI’s responses and your engagement with the topic."
    )

    formatted_chat_history = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_history])
    

    # Generate summary
    response = llm.invoke(
        input=f"{system_prompt}\n\nChat History:\n{formatted_chat_history}"
    ).content

    return response
  