const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken;

    // Nếu có access token, thử xác minh
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        return next();
      } catch (err) {
        if (!refreshToken) {
          return res.status(401).json({ message: "Access token expired" });
        }
        // Access token hết hạn, sẽ xử lý ở dưới
      }
    }

    // Nếu có refresh token, thử tạo lại access token mới
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Tạo access token mới
        const newAccessToken = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        // Gắn access token mới vào header response
        res.setHeader("x-access-token", newAccessToken);
        req.user = user;
        return next();
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Refresh token invalid or expired" });
      }
    }

    // Không có token nào cả
    return res.status(401).json({ message: "Authentication required" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authentication" });
  }
};

module.exports = authenticate;
