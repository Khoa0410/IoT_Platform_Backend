const express = require("express");
const router = express.Router();
const { sendCommand } = require("../controllers/mqttController");

router.post("/sendcommand", sendCommand);

module.exports = router;
