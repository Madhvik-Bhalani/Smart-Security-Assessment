const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController.js');
const auth = require('../Middleware/auth.js');

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);

module.exports = router;