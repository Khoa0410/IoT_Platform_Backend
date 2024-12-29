const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createChart,
  getCharts,
  deleteChart,
} = require("../controllers/chartController");

const router = express.Router();

router.get("/charts", getCharts);
router.post("/charts", createChart);
router.delete("/charts/:chartId", deleteChart);

module.exports = router;
