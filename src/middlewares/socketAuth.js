const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socketAuth = async (socket, next) => {
  try {
    // Lấy token từ query hoặc auth
    const token = socket.handshake.query.token || socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user info vào socket
    socket.userId = user._id.toString();
    socket.userEmail = user.email;
    socket.userName = user.name;

    console.log(`User ${user.email} connected via WebSocket`);
    next(); // Cho phép kết nối
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
};

module.exports = socketAuth;
