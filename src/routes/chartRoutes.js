const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { createChart, getCharts } = require("../controllers/chartController");

const router = express.Router();

router.get("/charts", authenticate, getCharts);
router.post("/charts", authenticate, createChart);

module.exports = router;
