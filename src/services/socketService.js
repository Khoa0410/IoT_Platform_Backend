// src/services/socketService.js
const socketAuth = require("../middlewares/socketAuth");

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    // Apply authentication middleware
    this.io.use(socketAuth);

    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const userRoom = this.getUserRoom(userId);

    // Join user vào room riêng của họ
    socket.join(userRoom);

    console.log(
      `User ${socket.userEmail} (ID: ${userId}) joined room: ${userRoom}`
    );

    // Gửi thông báo connection thành công
    socket.emit("connected", {
      message: "Connected successfully",
      userId: userId,
      room: userRoom,
      timestamp: new Date().toISOString(),
    });

    // Lắng nghe disconnect
    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.userEmail} disconnected: ${reason}`);
      // Socket.IO tự động remove khỏi rooms khi disconnect
    });

    // Lắng nghe request để lấy danh sách devices
    socket.on("get_user_devices", () => {
      this.handleGetUserDevices(socket);
    });

    // Lắng nghe ping để check connection
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });
  }

  // Helper method để tạo user room name consistent
  getUserRoom(userId) {
    return `user_${userId.toString()}`;
  }

  // Lấy danh sách devices của user
  async handleGetUserDevices(socket) {
    try {
      const Device = require("../models/device");
      const devices = await Device.find({ user: socket.userId }).select(
        "_id name topic"
      );

      socket.emit("user_devices", {
        devices: devices,
        count: devices.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting user devices:", error);
      socket.emit("error", { message: "Error fetching user devices" });
    }
  }

  // Emit data đến specific user room
  emitToUser(userId, event, data) {
    const userRoom = this.getUserRoom(userId);
    this.io.to(userRoom).emit(event, data);
    console.log(`Emitted ${event} to ${userRoom}`);
  }

  // Emit device data đến owner của device
  async emitDeviceData(deviceId, telemetryData) {
    try {
      const Device = require("../models/device");
      const device = await Device.findById(deviceId).select("name user");

      if (!device) {
        console.error(`Device ${deviceId} not found`);
        return;
      }

      const userId = device.user.toString();
      const userRoom = this.getUserRoom(userId);

      const payload = {
        deviceId: deviceId,
        deviceName: device.name,
        timestamp: new Date().toISOString(),
        data: telemetryData,
      };

      // Emit đến room của user owner
      this.io.to(userRoom).emit("device_data", payload);

      console.log(
        `Device data emitted to ${userRoom} for device: ${device.name}`
      );
    } catch (error) {
      console.error("Error emitting device data:", error);
    }
  }

  // Emit thông báo alert đến user
  async emitAlert(userId, alertData) {
    const userRoom = this.getUserRoom(userId);

    const payload = {
      type: "alert",
      timestamp: new Date().toISOString(),
      ...alertData,
    };

    this.io.to(userRoom).emit("alert_notification", payload);
    console.log(`Alert emitted to ${userRoom}`);
  }

  // Get số lượng connected users
  getConnectedUsersCount() {
    return this.io.sockets.sockets.size;
  }

  // Get danh sách rooms hiện tại
  getRooms() {
    return Array.from(this.io.sockets.adapter.rooms.keys());
  }

  // Broadcast message đến tất cả users (admin only)
  broadcastToAllUsers(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`Broadcasted ${event} to all users`);
  }
}

module.exports = WebSocketService;
