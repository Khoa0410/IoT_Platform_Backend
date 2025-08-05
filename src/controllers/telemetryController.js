const Device = require("../models/device");
const Telemetry = require("../models/telemetry");

// Lấy dữ liệu telemetry từ time series collection
exports.getTelemetry = async (req, res) => {
  const { id } = req.params; // Device ID
  const { field, startDate, endDate, limit = 100 } = req.query;

  try {
    // Kiểm tra device thuộc về user hiện tại
    const device = await Device.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!device) {
      return res
        .status(404)
        .json({ message: "Device not found or not authorized" });
    }

    // Build query cho time series collection
    let query = { deviceId: id };

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Query telemetry từ time series collection
    let telemetryData = await Telemetry.find(query)
      .sort({ timestamp: -1 }) // Sort mới nhất trước
      .limit(parseInt(limit));

    // Xử lý field filtering
    if (field) {
      // Parse multiple fields: "temperature,humidity" hoặc ["temperature", "humidity"]
      const fieldsArray = Array.isArray(field)
        ? field
        : field.split(",").map((f) => f.trim());

      // Filter và transform data cho multiple fields
      telemetryData = telemetryData
        .map((entry) => {
          const result = {
            timestamp: entry.timestamp,
            data: {},
          };

          fieldsArray.forEach((fieldName) => {
            const fieldData = entry.data[fieldName];
            if (fieldData !== undefined) {
              // Kiểm tra format: { value, unit } hoặc chỉ value
              if (
                fieldData &&
                typeof fieldData === "object" &&
                fieldData.hasOwnProperty("value")
              ) {
                result.data[fieldName] = fieldData; // Giữ nguyên { value, unit }
              } else {
                result.data[fieldName] = fieldData; // Format cũ - chỉ value
              }
            }
          });

          return result;
        })
        .filter((entry) => Object.keys(entry.data).length > 0); // Loại bỏ entries không có field nào
    } else {
      // Không filter field - trả về tất cả data
      telemetryData = telemetryData.map((entry) => ({
        timestamp: entry.timestamp,
        data: entry.data,
      }));
    }

    res.status(200).json({
      success: true,
      count: telemetryData.length,
      device: {
        id: device._id,
        name: device.name,
      },
      data: telemetryData,
    });
  } catch (error) {
    console.error("Error fetching telemetry data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching telemetry data",
      error: error.message,
    });
  }
};

// Lấy danh sách các fields có sẵn từ telemetry data
exports.getTelemetryFields = async (req, res) => {
  const { id } = req.params; // Device ID

  try {
    // Kiểm tra device thuộc về user hiện tại
    const device = await Device.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!device) {
      return res
        .status(404)
        .json({ message: "Device not found or not authorized" });
    }

    // Lấy bản ghi telemetry mới nhất để extract fields
    const latestTelemetry = await Telemetry.findOne({ deviceId: id }).sort({
      timestamp: -1,
    });

    if (!latestTelemetry) {
      return res.status(404).json({
        success: false,
        message: "No telemetry data found for this device",
      });
    }

    // Trích xuất fields từ data
    const fields =
      latestTelemetry.data && typeof latestTelemetry.data === "object"
        ? Object.keys(latestTelemetry.data)
        : [];

    // Thêm thông tin về data type và unit nếu có
    const fieldsWithInfo = fields.map((field) => {
      const fieldData = latestTelemetry.data[field];

      if (
        fieldData &&
        typeof fieldData === "object" &&
        fieldData.hasOwnProperty("value") &&
        fieldData.hasOwnProperty("unit")
      ) {
        return {
          name: field,
          dataType: typeof fieldData.value,
          unit: fieldData.unit,
          hasUnit: true,
        };
      } else {
        return {
          name: field,
          dataType: typeof fieldData,
          unit: null,
          hasUnit: false,
        };
      }
    });

    res.json({
      success: true,
      device: {
        id: device._id,
        name: device.name,
      },
      fields: fieldsWithInfo,
      totalFields: fields.length,
    });
  } catch (error) {
    console.error("Error fetching telemetry fields:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
