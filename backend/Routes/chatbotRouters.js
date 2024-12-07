const express = require("express");
const router = express.Router();
const chatbotController = require("../Controllers/chatbotController");

// Route to handle adding a new message
router.post("/message", chatbotController.addMessage);

// Route to get chat history for a user
router.get("/history/:email", chatbotController.getChatHistory);

module.exports = router;
