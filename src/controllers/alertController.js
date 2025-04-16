const Alert = require("../models/alert");
const authenticate = require("../middlewares/authenticate");

// Thêm cảnh báo mới
exports.createAlert = async (req, res) => {
  const { name, device, conditions, logic, emailNotification } = req.body;

  try {
    const existingAlert = await Alert.findOne({ name, user: req.user._id });
    if (existingAlert) {
      return res.status(400).json({ message: "Alert name already exists." });
    }

    if (!name || !device || !conditions || !Array.isArray(conditions)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Kiểm tra từng điều kiện có đầy đủ thông tin
    for (const condition of conditions) {
      const { sensorField, operator, value } = condition;
      if (!sensorField || !operator || value === undefined || isNaN(value)) {
        return res.status(400).json({ error: "Invalid condition format!" });
      }
    }

    const alert = new Alert({
      name,
      device,
      user: req.user._id,
      conditions,
      logic: logic || "OR",
      emailNotification,
    });

    await alert.save();
    // Populate device name sau khi lưu alert
    const populatedAlert = await Alert.findById(alert._id).populate(
      "device",
      "name"
    );

    res.status(201).json({
      message: "Alert created successfully.",
      alert: populatedAlert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ message: "Failed to create alert." });
  }
};

// Lấy danh sách cảnh báo
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).populate(
      "device",
      "name"
    );
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts." });
  }
};

// Xóa cảnh báo theo ID
exports.deleteAlert = async (req, res) => {
  const alertId = req.params.id;

  try {
    const alert = await Alert.findOne({ _id: alertId, user: req.user._id });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found." });
    }

    await Alert.deleteOne({ _id: alertId });

    res.status(200).json({ message: "Alert deleted successfully." });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ message: "Failed to delete alert." });
  }
};
