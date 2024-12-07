const express = require('express');
const { registerUser } = require('../controllers/authController');
const { loginUser } = require('../controllers/authController');

const router = express.Router();

// Endpoint đăng ký
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;