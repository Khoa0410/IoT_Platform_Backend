const { sendCommandToMQTT } = require("../services/mqttService");

exports.sendCommand = (req, res) => {
  const { topic, command } = req.body;

  // Kiểm tra các tham số đầu vào
  if (!topic || !command) {
    return res.status(400).json({ message: "Topic and command are required" });
  }

  try {
    // Gửi lệnh đến MQTT Broker
    sendCommandToMQTT(topic, command);
    return res.status(200).json({ message: "Command sent successfully" });
  } catch (error) {
    console.error("Error sending command:", error);
    return res.status(500).json({ message: "Failed to send command" });
  }
};
