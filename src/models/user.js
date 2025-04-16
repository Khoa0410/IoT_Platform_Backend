const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Lưu mật khẩu đã hash
  name: { type: String, required: true }, // Tên người dùng
  googleId: {
    type: String,
    required: false, // Google ID sẽ được lưu nếu người dùng đăng nhập qua Google
  },
  avatar: {
    type: String,
    required: false, // Avatar của người dùng từ Google
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
