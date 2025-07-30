const express = require("express");
const router = express.Router();
const { getSwaggerSpec } = require("../controllers/swaggerController");

// Không cần xác thực JWT ở đây
router.get("/swagger.yaml", getSwaggerSpec);

module.exports = router;
