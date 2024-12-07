const User = require('../models/user'); // Model User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Controller xử lý đăng ký
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng.' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    // Lưu vào cơ sở dữ liệu
    await newUser.save();

    // Trả về thông tin user (không bao gồm password)
    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
  }
};

// Controller xử lý đăng nhập
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Key bí mật
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};