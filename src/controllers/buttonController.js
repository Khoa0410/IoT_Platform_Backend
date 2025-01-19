const Button = require("../models/button");
const authenticate = require("../middlewares/authenticate");
const { sendCommandToMQTT } = require("../services/mqttService");

// Thêm button mới
exports.createButton = async (req, res) => {
  const { name, device, topic } = req.body;

  try {
    const existingButton = await Button.findOne({ name, user: req.user._id });
    if (existingButton) {
      return res.status(400).json({ message: "Button name already exists." });
    }

    if (!name || !device || !topic) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const button = new Button({ name, device, topic, user: req.user._id });
    await button.save();

    res.status(201).json(button);
  } catch (error) {
    console.error("Error creating button:", error);
    res.status(500).json({ message: "Failed to create button." });
  }
};

// Lấy danh sách button
exports.getButtons = async (req, res) => {
  try {
    const buttons = await Button.find({ user: req.user._id });
    res.status(200).json(buttons);
  } catch (error) {
    console.error("Error fetching buttons:", error);
    res.status(500).json({ message: "Failed to fetch buttons." });
  }
};

// Cập nhật trạng thái button
exports.updateButtonState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    const button = await Button.findById(id);
    if (!button) {
      return res.status(404).json({ message: "Button not found." });
    }

    button.state = state;
    await button.save();

    // Gửi lệnh MQTT (thực hiện gửi trạng thái của thiết bị)
    const command = {
      deviceId: button.device,
      state: state,
    };
    sendCommandToMQTT(button.topic, command);

    res.status(200).json(button);
  } catch (error) {
    console.error("Error updating button state:", error);
    res.status(500).json({ message: "Failed to update button state." });
  }
};

exports.deleteButton = async (req, res) => {
  const { id } = req.params;

  try {
    const button = await Button.findById(id);

    if (!button) {
      return res.status(404).json({ message: "Button not found" });
    }

    // Kiểm tra nếu button thuộc về người dùng hiện tại
    if (button.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this button" });
    }

    // Xóa button
    await button.deleteOne();
    res.status(200).json({ message: "Button deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting button", error });
  }
};
