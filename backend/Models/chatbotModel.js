const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  email: { type: String, required: true }, // User's email
  messages: [
    {
      prompt: String,  // User's input
      response: String, // Chatbot's response
    },
  ],
});

module.exports = mongoose.model("Chat", ChatSchema);
