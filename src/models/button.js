const mongoose = require("mongoose");

const ButtonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  state: {
    type: Boolean,
    default: false,
  },
  topic: {
    type: String,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

ButtonSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Button", ButtonSchema);
