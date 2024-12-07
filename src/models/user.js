const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Lưu mật khẩu đã hash
  name: { type: String, required: true }, // Tên người dùng
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
