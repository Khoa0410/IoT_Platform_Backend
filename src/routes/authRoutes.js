const express = require("express");
const {
  loginUser,
  registerUser,
  googleAuth,
} = require("../controllers/authController");

const router = express.Router();

// Endpoint đăng ký
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google", googleAuth);

module.exports = router;
