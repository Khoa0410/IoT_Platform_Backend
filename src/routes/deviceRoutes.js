const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createDevice,
  getDevices,
  deleteDevices,
  getTelemetry,
} = require("../controllers/deviceController");

const router = express.Router();

router.post("/devices", createDevice);
router.get("/devices", getDevices);
router.delete("/devices/:id", deleteDevices);
router.get("/devices/:id/telemetry", authenticate, getTelemetry);

module.exports = router;
