const express = require("express");
const {
  loginUser,
  registerUser,
  googleAuth,
  refreshToken,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

// Endpoint đăng ký
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google", googleAuth);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

module.exports = router;
