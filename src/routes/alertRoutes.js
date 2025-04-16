const express = require("express");
const { createAlert, getAlerts, deleteAlert } = require("../controllers/alertController");

const router = express.Router();
router.post("/alerts", createAlert);
router.get("/alerts", getAlerts);
router.delete("/alerts/:id", deleteAlert);

module.exports = router;
