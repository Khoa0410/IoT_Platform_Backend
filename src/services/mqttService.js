const mqtt = require("mqtt");
require("dotenv").config();
const Device = require("../models/device");

// Kết nối đến broker
const client = mqtt.connect(`mqtts://${process.env.MQTT_BROKER}`, {
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.on("connect", () => {
  console.log("Connected to MQTT Broker");
  client.subscribe("#", (err) => {
    if (err) {
      console.error("Failed to subscribe to all topics:", err);
    } else {
      console.log("Subscribed to all topics");
    }
  });
});

client.on("message", async (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);

  try {
    const payload = JSON.parse(message.toString());
    const { _id, telemetry } = payload;

    // Kiểm tra xem thiết bị có tồn tại không
    const device = await Device.findById(_id);
    if (!device) {
      console.error(`Device with ObjectId ${_id} does not exist.`);
      return;
    }

    // Kiểm tra người dùng có gửi đúng topic không
    if (device.topic !== topic) {
      console.error(`Invalid topic for device: ${_id}`);
      return;
    }

    // Taọ đối tượng telemetry
    const Telemetry = {
      timestamp: new Date(), // Tự động cập nhật timestamp
      data: telemetry,
    };

    // Cập nhật telemetry dữ liệu vào thiết bị
    device.telemetry.push(Telemetry);
    await device.save();

    console.log(`Telemetry data added to device: ${_id}`);
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

client.on("error", (error) => {
  console.error("MQTT Connection Error:", error);
});

module.exports = client;
