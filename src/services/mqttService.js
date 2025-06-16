const mqtt = require("mqtt");
require("dotenv").config();
const Device = require("../models/device");
const { checkAndTriggerAlerts } = require("../services/alertService");

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
    const { _id, telemetry, timestamp } = payload;
    if (timestamp) console.log(`Timestamp: ${timestamp}`);

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

    // Xử lý timestamp
    let telemetryTimestamp;
    if (timestamp) {
      const date = new Date(timestamp);
      // Kiểm tra xem timestamp có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error(`Invalid timestamp for device: ${_id}`);
        telemetryTimestamp = new Date(); // Nếu timestamp không hợp lệ, dùng thời gian hiện tại
      } else {
        telemetryTimestamp = timestamp;
      }
    } else {
      telemetryTimestamp = new Date(); // Không có timestamp: dùng thời gian hiện tại
    }
    console.log(`Telemetry timestamp: ${telemetryTimestamp}`);

    // Taọ đối tượng telemetry
    const Telemetry = {
      timestamp: telemetryTimestamp,
      data: telemetry,
    };

    // Thêm telemetry và sắp xếp theo timestamp
    await Device.updateOne({ _id }, { $push: { telemetry: Telemetry } });

    console.log(
      `Telemetry data added to device: ${_id}`,
      `Telmetry:`,
      Telemetry
    );

    // Kiểm tra điều kiện cảnh báo
    await checkAndTriggerAlerts(device._id, telemetry);
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

client.on("error", (error) => {
  console.error("MQTT Connection Error:", error);
});

const sendCommandToMQTT = (topic, command) => {
  try {
    if (!command || !topic) {
      console.error("Topic and Command cannot be empty.");
      return;
    }

    // Tạo payload
    const payload = JSON.stringify(command);

    // Gửi lệnh lên broker MQTT
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error("Failed to send command:", err);
      } else {
        console.log(`Command sent to topic ${topic}: ${payload}`);
      }
    });
  } catch (error) {
    console.error("Error sending command:", error);
  }
};

module.exports = { client, sendCommandToMQTT };
