const mqtt = require("mqtt");
require("dotenv").config();
const Device = require("../models/device");
const Telemetry = require("../models/telemetry");
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

    // Kiểm tra telemetry data có hợp lệ không
    if (!telemetry || typeof telemetry !== "object") {
      console.error(`Invalid telemetry data for device: ${_id}`);
      return;
    }

    // Xử lý timestamp
    let telemetryTimestamp;
    if (timestamp) {
      const date = new Date(timestamp);
      // Kiểm tra xem timestamp có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error(`Invalid timestamp for device: ${_id}`);
        return;
      } else {
        telemetryTimestamp = date;
        console.log(`Using provided timestamp: ${timestamp}`);
      }
    } else {
      telemetryTimestamp = new Date(); // Không có timestamp: dùng thời gian hiện tại
      console.log(
        `Using current timestamp: ${telemetryTimestamp.toISOString()}`
      );
    }

    console.log(`Telemetry data received:`, telemetry);

    // Tạo telemetry record mới trong time series collection
    // Giữ nguyên cấu trúc { value, unit } trong data
    const telemetryRecord = new Telemetry({
      deviceId: _id,
      timestamp: telemetryTimestamp,
      data: telemetry, // Lưu trực tiếp format { field: { value, unit } }
    });

    // Lưu vào time series collection
    await telemetryRecord.save();

    console.log(
      `Telemetry data saved to time series collection for device: ${_id}`
    );

    // Emit realtime data qua WebSocket
    if (global.websocketService) {
      await global.websocketService.emitDeviceData(_id, telemetry);
    }

    // Tạo processedData chỉ với values cho alert service
    const processedData = {};
    Object.keys(telemetry).forEach((key) => {
      const fieldData = telemetry[key];

      // Kiểm tra format: { value: number, unit: string }
      if (
        fieldData &&
        typeof fieldData === "object" &&
        fieldData.hasOwnProperty("value")
      ) {
        processedData[key] = fieldData.value;
      } else {
        // Fallback cho format cũ (chỉ có value)
        processedData[key] = fieldData;
      }
    });

    // Kiểm tra điều kiện cảnh báo (chỉ dùng processed data - values only)
    await checkAndTriggerAlerts(device._id, processedData);
  } catch (error) {
    console.error("Error processing MQTT message:", error);
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
