const express = require("express");
const {
  getTelemetry,
  getTelemetryFields,
} = require("../controllers/telemetryController");

const router = express.Router();

// Lấy dữ liệu telemetry của device
router.get("/telemetry/:id", getTelemetry);

// Lấy danh sách fields có sẵn
router.get("/telemetry/fields/:id", getTelemetryFields);

module.exports = router;
