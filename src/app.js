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
const telemetryRoutes = require("./routes/telemetryRoutes");
const { baseUrl } = require("./config");
const swaggerRoutes = require("./routes/swaggerRoutes");

//socket.io setup
const http = require("http");
const { Server } = require("socket.io");
const WebSocketService = require("./services/socketService");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  baseUrl, // frontend dev
  "https://swagger-ui-tau.vercel.app", // swagger UI
];

// socket service initialization
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true, // Cho phép gửi cookie
  },
});

global.websocketService = new WebSocketService(io);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`CORS request from origin: ${origin}`); // Debug log
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`); // Debug log
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
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

// Route Swagger
app.use("/api", swaggerRoutes);

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

// Route quản lý telemetry data
app.use("/api", authenticate, telemetryRoutes);

// Route quản lý MQTT
app.use("/api/mqtt", mqttRoutes);

// Khởi chạy server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready`);
});
