const User = require("../models/user"); // Model User
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Controller xử lý đăng ký
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng." });
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
      message: "Đăng ký thành công!",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi, vui lòng thử lại sau." });
  }
};

// Controller xử lý đăng nhập qua Google OAuth
exports.googleAuth = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    // Gửi yêu cầu POST tới Google để đổi authorization code lấy access_token và id_token
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code: code, // Authorization code mà Google trả về
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          // redirect_uri: "http://localhost:3001/api/auth/google",
          redirect_uri:
            "https://iot-platform-backend.onrender.com/api/auth/google",
          grant_type: "authorization_code", // Grant type cho OAuth 2.0
        },
      }
    );

    // Lấy access_token và id_token từ response
    const { access_token, id_token } = response.data;

    // Dùng id_token để lấy thông tin người dùng từ Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Lấy thông tin người dùng từ Google (email, name, avatar)
    const { email, name, picture } = userInfoResponse.data;

    // Kiểm tra xem người dùng có trong cơ sở dữ liệu không
    let user = await User.findOne({ email });

    // Nếu người dùng chưa tồn tại trong cơ sở dữ liệu, tạo mới người dùng
    if (!user) {
      user = new User({
        email,
        name,
        avatar: picture, // Lưu avatar từ Google
        googleId: userInfoResponse.data.sub, // Google user ID
        password: null, // Không cần mật khẩu vì đây là đăng nhập qua OAuth
      });

      await user.save();
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Chuyển hướng người dùng về frontend với token trong URL
    // const frontendUrl = `http://localhost:3000/login/?token=${token}`; // URL frontend
    const frontendUrl = `https://iot-platform-frontend-dae-micus-projects.vercel.app/login/?token=${token}`; // URL frontend
    res.redirect(frontendUrl);
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller xử lý đăng nhập
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    // Kiểm tra nếu user được tạo qua Google OAuth thì không cần password
    if (!user.password) {
      return res.status(400).json({
        error:
          "Tài khoản này được tạo qua Google. Vui lòng đăng nhập bằng Google.",
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Key bí mật
      { expiresIn: "1h" } // Token hết hạn sau 1 giờ
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
