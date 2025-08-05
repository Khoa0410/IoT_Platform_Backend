const mongoose = require("mongoose");
const Device = require("../models/device");
const Chart = require("../models/chart");
const Button = require("../models/button");
const Alert = require("../models/alert");
const Telemetry = require("../models/telemetry");

// Tạo thiết bị mới
exports.createDevice = async (req, res) => {
  const { name, topic } = req.body;
  try {
    const newDevice = new Device({
      name,
      topic,
      user: req.user._id,
    });
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: "Device's name already exist", error });
  }
};

// Lấy danh sách thiết bị của người dùng
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ user: req.user._id });
    res.status(200).json(devices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching devices", error });
  }
};

// Lấy thông tin thiết bị theo ID
exports.getDeviceById = async (req, res) => {
  const { id } = req.params; // Lấy ID thiết bị từ URL

  try {
    // Tìm thiết bị thuộc về người dùng hiện tại
    const device = await Device.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!device) {
      return res
        .status(404)
        .json({ message: "Device not found or not authorized" });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error("Error fetching device by ID:", error);
    res.status(500).json({ message: "Error fetching device", error });
  }
};

// Cập nhật thông tin thiết bị (name, topic)
exports.updateDevice = async (req, res) => {
  const { id } = req.params;
  const { name, topic } = req.body;

  try {
    const device = await Device.findOne({ _id: id, user: req.user._id });
    if (!device) {
      return res
        .status(404)
        .json({ message: "Device not found or unauthorized" });
    }

    if (name) device.name = name;
    if (topic) device.topic = topic;

    await device.save();

    res.status(200).json({ message: "Device updated successfully", device });
  } catch (error) {
    // Handle MongoDB duplicate key error (Trùng tên thiết bị)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Device name already exists. Please choose another name.",
      });
    }

    res.status(500).json({ message: "Error updating device", error });
  }
};

exports.deleteDevices = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Tìm và xóa device thuộc về user đang đăng nhập
    const deletedDevice = await Device.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedDevice) {
      return res
        .status(404)
        .json({ message: "Device not found or not authorized to delete" });
    }

    // Xóa các tài nguyên liên quan: charts, buttons, alerts
    await Telemetry.deleteMany({ device: id }, { session });
    await Chart.deleteMany({ device: id }, { session });
    await Button.deleteMany({ device: id }, { session });
    await Alert.deleteMany({ device: id }, { session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Device deleted successfully", deletedDevice });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error deleting device", error });
  }
};
