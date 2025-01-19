const express = require("express");
const {
  getButtons,
  createButton,
  updateButtonState,
  deleteButton,
} = require("../controllers/buttonController");

const router = express.Router();
router.get("/buttons", getButtons);
router.post("/buttons", createButton);
router.put("/buttons/:id", updateButtonState);
router.delete("/buttons/:id", deleteButton);

module.exports = router;
