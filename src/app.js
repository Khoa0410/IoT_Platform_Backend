const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mqttService = require("./services/mqttService");
const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middlewares/authenticate");
const deviceRoutes = require("./routes/deviceRoutes");
const chartRoutes = require("./routes/chartRoutes");
const mqttRoutes = require("./routes/mqttRoutes");
const buttonRoutes = require("./routes/buttonRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(authenticate);

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

// RRoute quản lý thiết bị
app.use("/api", deviceRoutes);

// Route đăng ký đăng nhập
app.use("/api/auth", authRoutes);

// Route quản lý biểu đồ
app.use("/api", chartRoutes);

// Route quản lý nút điều khiển thiết bị
app.use("/api", buttonRoutes);

// Route quản lý MQTT
app.use("/api/mqtt", mqttRoutes);

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
