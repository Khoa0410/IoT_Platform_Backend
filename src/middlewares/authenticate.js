const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Model user

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header
    if (!token) {
      return next();
    }

    // Giải mã token để lấy thông tin user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy ObjectId của user từ database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gắn user vào request để sử dụng ở các bước sau
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
