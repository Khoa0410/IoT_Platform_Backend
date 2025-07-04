const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevices,
  getTelemetry,
  getTelemetryField,
} = require("../controllers/deviceController");

const router = express.Router();

router.get("/devices", getDevices);
router.get("/devices/:id", getDeviceById);
router.post("/devices", createDevice);
router.put("/devices/:id", updateDevice);
router.delete("/devices/:id", deleteDevices);
router.get("/devices/:id/telemetry", getTelemetry);
router.get("/devices/:id/telemetry-field", getTelemetryField);

module.exports = router;
