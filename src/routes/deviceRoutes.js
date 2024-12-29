const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createDevice,
  getDevices,
  deleteDevices,
  getTelemetry,
} = require("../controllers/deviceController");

const router = express.Router();

router.get("/devices", getDevices);
router.post("/devices", createDevice);
router.delete("/devices/:id", deleteDevices);
router.get("/devices/:id/telemetry", getTelemetry);

module.exports = router;
