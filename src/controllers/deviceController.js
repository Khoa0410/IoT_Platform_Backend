const mongoose = require('mongoose');
const Device = require("../models/device");
const Chart = require("../models/chart");
const Button = require("../models/button");
const Alert = require("../models/alert");

exports.createDevice = async (req, res) => {
  const { name, topic, telemetry } = req.body;
  try {
    const newDevice = new Device({
      name,
      topic,
      user: req.user._id,
      telemetry,
    });
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: "Device's name already exist", error });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ user: req.user._id });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching devices", error });
  }
};

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

    // Kiểm tra tên trùng lặp trong cùng user
    if (name && name !== device.name) {
      const nameExists = await Device.findOne({
        name,
        user: req.user._id,
        _id: { $ne: id },
      });

      if (nameExists) {
        return res.status(400).json({
          message: "Device name already exists. Please choose another name.",
        });
      }
    }

    if (name) device.name = name;
    if (topic) device.topic = topic;

    await device.save();

    res.status(200).json({ message: "Device updated successfully", device });
  } catch (error) {
    console.error("Error updating device:", error);
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

exports.getTelemetry = async (req, res) => {
  const { id } = req.params; // Lấy ID thiết bị từ URL
  const { field, startDate, endDate } = req.query; // Các tham số lọc từ query

  try {
    // Tìm thiết bị thuộc về người dùng đang đăng nhập
    const device = await Device.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!device) {
      return res
        .status(404)
        .json({ message: "Device not found or not authorized" });
    }

    // Lấy danh sách telemetry
    let telemetry = device.telemetry;

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      telemetry = telemetry.filter((entry) => {
        const timestamp = new Date(entry.timestamp);
        if (startDate && timestamp < new Date(startDate)) return false;
        if (endDate && timestamp > new Date(endDate)) return false;
        return true;
      });
    }

    // Lọc theo trường dữ liệu
    if (field) {
      telemetry = telemetry
        .map((entry) => ({
          timestamp: entry.timestamp,
          value: entry.data[field], // Chỉ giữ giá trị của trường được chỉ định
        }))
        .filter((entry) => entry.value !== undefined); // Loại bỏ các giá trị không tồn tại
    }

    res.status(200).json(telemetry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching telemetry data", error });
  }
};
