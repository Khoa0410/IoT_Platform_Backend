const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const mqttService = require("./services/mqttService");
const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middlewares/authenticate");
const deviceRoutes = require("./routes/deviceRoutes");
const chartRoutes = require("./routes/chartRoutes");
const mqttRoutes = require("./routes/mqttRoutes");
const buttonRoutes = require("./routes/buttonRoutes");
const alertRoutes = require("./routes/alertRoutes");
const { baseUrl } = require("./config");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(
  cors({
    origin: baseUrl, // domain frontend
    credentials: true, // Cho phép gửi cookie
  })
);
app.use(cookieParser());

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

// Route đăng ký đăng nhập
app.use("/api/auth", authRoutes);

// Route quản lý thiết bị
app.use("/api", authenticate, deviceRoutes);

// Route quản lý biểu đồ
app.use("/api", authenticate, chartRoutes);

// Route quản lý nút điều khiển thiết bị
app.use("/api", authenticate, buttonRoutes);

// Route quản lý cảnh báo người dùng
app.use("/api", authenticate, alertRoutes);

// Route quản lý MQTT
app.use("/api/mqtt", mqttRoutes);

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
