const Chat = require("../Models/chatbotModel");
const axios = require("axios");

exports.addMessage = async (req, res) => {
  const { email, prompt } = req.body;

  try {
    // Call Python API to get chatbot response
    const pythonResponse = await axios.post("http://127.0.0.1:8000/chat", { prompt });
    const assistantResponse = pythonResponse.data.response;

    // Find or create the user's chat document and add the new message
    const chat = await Chat.findOneAndUpdate(
      { email },
      { $push: { messages: { prompt, response: assistantResponse } } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      status: true,
      message: "Message added successfully!",
      chat: chat.messages,
    });
  } catch (error) {
    console.error("Error adding message:", error.message);
    res.status(500).json({
      status: false,
      message: "Failed to add message",
      error: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  const { email } = req.params;

  try {
    const chat = await Chat.findOne({ email });
    if (!chat) {
      return res.status(404).json({
        status: false,
        message: "No chat history found for this user",
      });
    }

    res.status(200).json({
      status: true,
      message: "Chat history retrieved successfully",
      chat: chat.messages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({
      status: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};
